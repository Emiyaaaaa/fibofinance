import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiGroupLine,
} from "@remixicon/react";
import { useTranslations } from "next-intl";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { useMemo, useState } from "react";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";

import { useGroup } from "@/utils/store/useGroup";
import { useConfirm } from "@/utils/hook/useComfirm";

function GroupSwitcher() {
  const { groupId, groupList, changeGroup, refreshGroupList, setGroupList } =
    useGroup();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const t = useTranslations("addGroup");
  const { ComfirmModel, openConfirm } = useConfirm({
    message: t("deleteGroup"),
    color: "danger",
  });

  const selectedKeys = useMemo(() => {
    return groupId ? new Set([groupId.toString()]) : undefined;
  }, [groupId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (isEdit) {
      fetch(`/api/finance/group`, {
        method: "PATCH",
        body: JSON.stringify({
          id: groupId,
          name: data.name,
        }),
      }).then(refreshGroupList);
    } else {
      fetch(`/api/finance/group`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          refreshGroupList();
          changeGroup(res.id);
        });
    }

    onClose();
  };

  const handleDelete = async () => {
    const isConfirm = await openConfirm();

    if (!isConfirm) {
      return;
    }

    fetch(`/api/finance/group`, {
      method: "DELETE",
      body: JSON.stringify({
        id: groupId,
      }),
    }).then(refreshGroupList);

    onClose();
    changeGroup(groupList.filter((group) => group.id !== groupId)[0].id);
  };

  const handleSetIsDefault = () => {
    const currentGroup = groupList.find((group) => group.id === groupId);

    if (!currentGroup) return;

    if (currentGroup.is_default) {
      return;
    }

    const newGroupList = groupList.map((group) => ({
      ...group,
      is_default: group.id === groupId,
    }));

    setGroupList(newGroupList);

    fetch("/api/finance/group/default", {
      method: "POST",
      body: JSON.stringify({ id: groupId }),
    }).then(refreshGroupList);
  };

  return (
    <>
      <ComfirmModel />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {isEdit ? t("editTitle") : t("createTitle")}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody className="w-full">
              <div className="flex w-full flex-row gap-4 pb-9">
                <Input
                  className="w-full flex-1"
                  defaultValue={
                    isEdit
                      ? groupList.find((group) => group.id === groupId)?.name
                      : ""
                  }
                  name="name"
                  placeholder={t("namePlaceholder")}
                />
                <Button color="primary" type="submit">
                  {isEdit ? t("editSubmitButton") : t("addSubmitButton")}
                </Button>
              </div>
            </ModalBody>
          </Form>
        </ModalContent>
      </Modal>
      <Dropdown>
        <DropdownTrigger>
          <RiGroupLine className="cursor-pointer" size={21} />
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          selectedKeys={selectedKeys}
          selectionMode="single"
        >
          <DropdownSection showDivider>
            {groupList.map(({ id, name }) => (
              <DropdownItem
                key={id.toString()}
                className={id === groupId ? "text-primary" : ""}
                color={id === groupId ? "primary" : "default"}
                onPress={() => changeGroup(id)}
              >
                {name === "Default Group" ? t("Default Group") : name}
              </DropdownItem>
            ))}
          </DropdownSection>
          <DropdownSection>
            <DropdownItem
              key={"add"}
              endContent={<RiAddLine size={14} />}
              onPress={() => {
                setIsEdit(false);
                onOpen();
              }}
            >
              {t("addEntry")}
            </DropdownItem>
            <DropdownItem
              key={"edit"}
              endContent={<RiEditLine size={14} />}
              onPress={() => {
                setIsEdit(true);
                onOpen();
              }}
            >
              {t("editEntry")}
            </DropdownItem>
            <DropdownItem
              key={"setDefault"}
              endContent={
                <Checkbox
                  className="translate-x-[0.5rem]"
                  isSelected={
                    groupList.find((group) => group.id === groupId)?.is_default
                  }
                  size="sm"
                  onSelect={handleSetIsDefault}
                />
              }
              onPress={handleSetIsDefault}
            >
              {t("setToDefault")}
            </DropdownItem>
            {groupList.length > 1 ? (
              <DropdownItem
                key={"delete"}
                className="text-danger"
                color="danger"
                endContent={<RiDeleteBinLine size={14} />}
                onPress={handleDelete}
              >
                {t("deleteCurrentGroup")}
              </DropdownItem>
            ) : null}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}

export default GroupSwitcher;
