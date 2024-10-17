import {FormActionType} from "./types";
import {Button, Popconfirm} from "antd";
import {useContext, useEffect, useState} from "react";
import http from "../../../lib/http";
import {FormContext} from "../../FormContext";
import {modal, replaceParams, replaceUrl, routerNavigateTo} from "../../../lib/helpers";
import {ModalContext} from "../../ModalContext";
import {TableContext} from "../../TableContext";

export default function (props: FormActionType & {
    props: any,

    // 操作
    submit?: boolean | {
        confirm?: string
    },
    request?: RequestOptions,
    link?: {
        url: string,
    }
    back?: boolean,
    reset?: boolean,
    modal?: ModalOptions,
}) {

    const [loading, setLoading] = useState(false)
    const formContext = useContext(FormContext)
    const tableContext = useContext(TableContext)
    const modalContext = useContext(ModalContext)

    const onClick = async () => {
        try {
            setLoading(true)
            const handleAfterAction = async (req?: RequestOptions) => {
                if (req?.afterAction?.includes('tableReload')) {
                    if (modalContext.contexts) {
                        modalContext.setAfterClose(() => {
                            modalContext.contexts?.tableContext?.actionRef.reload()
                        })
                    }
                    if (tableContext.actionRef) {
                        await tableContext.actionRef.reload()
                    }
                }
                if (req?.afterAction?.includes('closeModal') && modalContext.inModal) {
                    modalContext.closeModal()
                }
            }

            if (props.submit) {
                formContext.formRef?.current?.submit()
                return
            }
            if (props.request) {
                await http({
                    method: props.request.method,
                    url: props.request.url,
                    headers: props.request.headers || {},
                    data: replaceParams(props.request.data || {}, {
                        ...(await formContext.formRef?.current?.getFieldsValue()),
                    })
                })

                await handleAfterAction(props.request)
                return
            }
            if (props.modal) {
                await modal({
                    ...props.modal,
                    content: {
                        ...props.modal.content,
                        url: replaceUrl(props.modal.content.url as string, formContext.formRef?.current?.getFieldsValue())
                    }
                })
                return
            }

            if (props.link) {
                routerNavigateTo(replaceUrl(props.link.url, await formContext.formRef?.current?.getFieldsValue()))
                return
            }
            if (props.reset) {
                formContext.formRef?.current?.resetFields()
                return
            }
            if (props.back) {
                history.back()
                return
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (props.submit) {
            setLoading(props.loading || false)
        }
    }, [props.loading]);

    const MyButton = ({onClick}: {
        onClick?: () => void,
    }) => {

        return <>
            <Button {...props.props}
                    onClick={onClick}
                    loading={loading}
            >{props.title}</Button>
        </>
    }

    const confirm = (typeof props.submit === 'object' ? props.submit.confirm : null)
        || props.request?.confirm

    return <>
        {
            confirm ?
                <Popconfirm title={confirm} onConfirm={onClick}>
                    <MyButton></MyButton>
                </Popconfirm>
                : <MyButton onClick={onClick}></MyButton>
        }
    </>
}