import {ProColumnType, ProSchema} from "@ant-design/pro-components";
import {UploadFile} from "antd";
import http from "./http";

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

        return {
            ...schema,
            transform: uploadTransform,
        }
    },
    file: schema => {
        schema.formItemProps.rules.push({
            validator: uploadValidator,
        })

        return {
            ...schema,
            transform: uploadTransform,
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