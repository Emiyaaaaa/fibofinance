import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
  Form,
  Button,
  Checkbox,
  Spinner,
} from "@heroui/react";
import { RiAddLine, RiArrowDropDownLine, RiDeleteBinLine, RiEditLine } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { useGroup } from "@/utils/store/useGroup";
import { useConfirm } from "@/utils/hook/useComfirm";

function GroupSwitcher() {
  const { inited, groupId, groupList, changeGroup, refreshGroupList, setGroupList } = useGroup();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const t = useTranslations("addGroup");
  const currentGroup = useMemo(() => groupList.find((group) => group.id === groupId), [groupList, groupId]);
  const { ComfirmModal, openConfirm } = useConfirm({
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
      fetch(`/api/group`, {
        method: "PATCH",
        body: JSON.stringify({
          id: groupId,
          name: data.name,
        }),
      }).then(refreshGroupList);
    } else {
      fetch(`/api/group`, {
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

    fetch(`/api/group`, {
      method: "DELETE",
      body: JSON.stringify({
        id: groupId,
      }),
    }).then(refreshGroupList);

    onClose();
    changeGroup(groupList.filter((group) => group.id !== groupId)[0].id);
  };

  const handleSetIsDefault = () => {
    if (!currentGroup) return;

    if (currentGroup.is_default) {
      return;
    }

    const newGroupList = groupList.map((group) => ({
      ...group,
      is_default: group.id === groupId,
    }));

    setGroupList(newGroupList);

    fetch("/api/group/default", {
      method: "POST",
      body: JSON.stringify({ id: groupId }),
    }).then(refreshGroupList);
  };

  return (
    <>
      <ComfirmModal />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{isEdit ? t("editTitle") : t("createTitle")}</ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody className="w-full">
              <div className="flex w-full flex-row gap-4 pb-9">
                <Input
                  className="w-full flex-1"
                  defaultValue={isEdit && currentGroup?.name ? t(currentGroup.name) : ""}
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
          <Button size="sm" color="primary" className="h-6 gap-0.5">
            {inited ? (
              <>
                {currentGroup?.name}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 800 800"
                  fill="currentColor"
                >
                  <g transform="translate(0,800) scale(0.1,-0.1)">
                    <path d="M2202 5280 c-212 -44 -359 -249 -323 -451 19 -112 49 -154 235 -336 304 -297 761 -748 1181 -1165 451 -447 453 -449 596 -471 81 -12 163 -1 239 35 39 18 220 192 891 858 463 459 856 850 873 868 140 151 138 383 -4 536 -98 104 -227 151 -352 128 -136 -25 -128 -17 -889 -772 -386 -382 -703 -695 -705 -695 -2 0 -148 142 -325 315 -886 868 -1077 1054 -1113 1081 -78 58 -211 88 -304 69z" />
                  </g>
                </svg>
              </>
            ) : (
              <Spinner classNames={{ dots: "bg-black translate-y-[-50%]" }} variant="dots" size="sm" />
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu disallowEmptySelection selectedKeys={selectedKeys} selectionMode="single">
          <DropdownSection showDivider>
            {groupList.map(({ id, name, is_default }) => (
              <DropdownItem
                key={id.toString()}
                className={id === groupId ? "text-primary" : ""}
                color={id === groupId ? "primary" : "default"}
                onPress={() => changeGroup(id)}
              >
                {t(name)}
                {is_default && (
                  <span className="bg-white/7 rounded text-[10px] px-[5px] py-[2px] ml-[8px]">{t("default")}</span>
                )}
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
                  className="translate-x-2"
                  isSelected={currentGroup?.is_default}
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
