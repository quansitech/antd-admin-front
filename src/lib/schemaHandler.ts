import {ProColumnType, ProSchema} from "@ant-design/pro-components";
import {UploadFile} from "antd";
import http from "./http";
import {handleCondition} from "./helpers";

type Handler = (schema: any) => ProSchema | ProColumnType

const uploadValidator = (_: unknown, value: UploadFile[]) => {
    return new Promise((resolve, reject) => {
        if (!value) {
            resolve(true)
            return
        }
        for (let i = 0; i < value.length; i++) {
            switch (value[i].status) {
                case 'error':
                    reject('存在上传失败文件，请删除失败文件后重新上传')
                    return
                case 'uploading':
                    reject('文件上传中，请稍后')
                    return
            }
        }
        resolve(true)
    })
}

const uploadTransform = (value?: UploadFile[], _name?: string) => {
    if (value instanceof Array) {
        return value.filter(file => file.status === 'done')
            .map((file: UploadFile) => {
                return file.response?.file_id
            }).join(',')
    }
    return value
}

export const commonHandler: Handler = schema => {
    if (schema.valueEnum) {
        schema.valueEnum = new Map(schema.valueEnum)
    }
    return schema
}

export const schemaHandler: Record<string, Handler> = {
    dateTimeRange: schema => {
        if (schema.search !== false) {
            return {
                ...schema,
                search: {
                    transform(value) {
                        if (value) {
                            return value.join(' - ')
                        }
                        return value
                    }
                }
            }
        }

        return {
            ...schema,
        }
    },
    dateRange: schema => {
        if (schema.search !== false) {
            return {
                ...schema,
                search: {
                    transform(value) {
                        if (value) {
                            return value.join(' - ')
                        }
                        return value
                    }
                }
            }
        }

        return {
            ...schema,
        }
    },

    // 上传
    image: schema => {
        schema.formItemProps.rules.push({
            validator: uploadValidator,
        })
        schema.fieldProps.dataIndex = schema.dataIndex
        return {
            ...schema,
            transform: uploadTransform,
        }
    },
    file: schema => {
        schema.formItemProps.rules.push({
            validator: uploadValidator,
        })
        schema.fieldProps.dataIndex = schema.dataIndex

        return {
            ...schema,
            transform: uploadTransform,
        }
    },

    action: schema => {
        schema.fieldProps = {actions: schema.actions}
        return schema
    },

    dependency: schema => {
        const {columns, valueType} = schema

        return {
            valueType,
            name: [schema.showCondition.field],
            columns(fields: Record<string, any>) {
                return handleCondition(schema.showCondition, fields) ? columns : []
            },
        } as ProSchema
    },

    ueditor: schema => {
        if (!schema.formItemProps) {
            schema.formItemProps = {}
        }
        if (!schema.formItemProps.rules) {
            schema.formItemProps.rules = []
        }
        schema.formItemProps.rules.push({
            validator: async (rule, value) => {
                if (value.slice(0, 7) === '[抓取图片中]') {
                    throw new Error('请等待图片抓取完成')
                }

                return true
            },
        })
        return {
            ...schema
        }
    },

    select(schema) {
        schema.searchOnChange = true
        if (schema.fieldProps?.searchUrl) {
            return {
                ...schema,
                request: async params => {
                    const res = await http(schema.fieldProps.searchUrl, {params})
                    return res.data.map((item: { value: any, label?: string }) => ({
                        label: item.label || item.value,
                        value: item.value
                    }))
                }
            }
        }
        return schema
    },
}