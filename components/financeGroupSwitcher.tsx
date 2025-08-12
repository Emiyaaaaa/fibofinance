import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { SharedSelection } from "@heroui/system";
import { RiAddLine, RiDeleteBinLine, RiEditLine } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useFinanceGroupData from "@/utils/store/useFinanceGroupData";

export default function FinanceGroupSwitcher(props: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const t = useTranslations("financeGroup");
  const { isOpen: isOpenAddGroup, onOpen: onOpenAddGroup, onClose: onCloseAddGroup } = useDisclosure();
  const [editGroupId, setEditGroupId] = useState<number | undefined>(undefined);
  const [newGroupName, setNewGroupName] = useState<string>("");

  const { data: financeGroups, refresh: refreshFinanceGroups, loading: isFinanceGroupsLoading } = useFinanceGroupData();

  const handleChange = (keys: SharedSelection) => {
    if (keys.currentKey === "noGroup") {
      props.onChange(undefined);
      return;
    }
    if (keys.currentKey === "add") {
      onOpenAddGroup();
      return;
    }
    if (keys.currentKey === "delete") {
      fetch("/api/finance/group", {
        method: "DELETE",
        body: JSON.stringify({ id: props.value }),
      }).then(() => {
        refreshFinanceGroups();
      });
      return;
    }
    if (keys.currentKey === "edit") {
      setEditGroupId(props.value);
      setNewGroupName(financeGroups?.find((group: { id: number }) => group.id === props.value)?.name || "");
      onOpenAddGroup();
      return;
    }
    props.onChange(keys.currentKey ? Number(keys.currentKey) : undefined);
  };

  const handleAddGroup = () => {
    onCloseAddGroup();
    setNewGroupName("");

    fetch("/api/finance/group", {
      method: editGroupId ? "PATCH" : "POST",
      body: JSON.stringify({ id: editGroupId, name: newGroupName }),
    })
      .then((res) => res.json())
      .then(({ id }: { id: string }) => {
        refreshFinanceGroups();
        props.onChange(Number(id));
      });

    setEditGroupId(undefined);
  };

  return (
    <>
      {isOpenAddGroup && (
        <Modal isOpen={isOpenAddGroup}>
          <ModalContent>
            <ModalHeader>
              <h2>{editGroupId ? t("editGroup") : t("addGroup")}</h2>
            </ModalHeader>
            <ModalBody>
              <Input
                placeholder={t("name")}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                variant="bordered"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={() => {
                  setNewGroupName("");
                  setEditGroupId(undefined);
                  onCloseAddGroup();
                }}
              >
                {t("cancel")}
              </Button>
              <Button color="primary" isDisabled={!newGroupName} onPress={handleAddGroup}>
                {t("confirm")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Select
          isLoading={isFinanceGroupsLoading}
          className="max-w-xs"
          label={t("group")}
          placeholder={t("empty")}
          selectedKeys={props.value ? [props.value.toString()] : []}
          onSelectionChange={handleChange}
        >
          <SelectItem key="noGroup">{t("noGroup")}</SelectItem>
          {(financeGroups as any)?.map((group: { id: number; name: string }) => (
            <SelectItem key={group.id.toString()}>{group.name}</SelectItem>
          ))}
          <SelectItem key="edit">
            <div className="flex items-center gap-2">
              <RiEditLine size={16} />
              {t("editGroup")}
            </div>
          </SelectItem>
          <SelectItem key={"add"}>
            <div className="flex items-center gap-2">
              <RiAddLine size={16} />
              {t("addGroup")}
            </div>
          </SelectItem>
          <SelectItem key={"delete"}>
            <div className="flex items-center gap-2 text-red-500">
              <RiDeleteBinLine size={16} />
              {t("deleteGroup")}
            </div>
          </SelectItem>
        </Select>
      </div>
    </>
  );
}
