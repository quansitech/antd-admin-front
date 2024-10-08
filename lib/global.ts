import {MessageInstance} from "antd/es/message/interface";
import {ModalStaticFunctions} from "antd/es/modal/confirm";
import {NotificationInstance} from "antd/es/notification/interface";

const global = {} as {
    message: MessageInstance,
    modal: Omit<ModalStaticFunctions, 'warn'>,
    notification: NotificationInstance,
}

export default global