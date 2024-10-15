import http from "./http";
import {AxiosError} from "axios";
import {UploadRequestOption} from "rc-upload/lib/interface";
import {GetProp, message, Upload, UploadFile, UploadProps} from "antd";
import {md5} from "js-md5"

type QsUploadFile = UploadFile & {
    hash_id?: string,
}

export async function customRequest(options: UploadRequestOption & {
    file: QsUploadFile
}) {
    const policyRes = await http({
        url: options.action,
        method: 'get',
        headers: options.headers,
        fetchOptions: {
            noHandle: true
        },
        params: {
            title: options.file.name,
            hash_id: options.file.hash_id,
            file_type: options.file?.type || '' as string
        }
    })
    if (policyRes.data.status) {
        options.onSuccess && options.onSuccess({
            ...policyRes.data,
            url: policyRes.data.url || policyRes.data.file_url
        })
        return
    }

    const formData = new FormData();
    let url = ''
    if (policyRes.data.server_url) {
        url = policyRes.data.server_url
    } else if (policyRes.data.url) {
        url = policyRes.data.url
    }
    if (policyRes.data.params) {
        for (const key in policyRes.data.params) {
            formData.append(key, policyRes.data.params[key])
        }
    }

    formData.append('file', options.file)
    try {
        const res = await http({
            url: url,
            method: 'post',
            data: formData,
            fetchOptions: {
                noHandle: true
            },
            headers: options.headers,
            onUploadProgress(ev) {
                options.onProgress && options.onProgress({
                    percent: (ev.progress || 0) * 100
                })
            },
        })

        if (res.data.info) {
            message.error(res.data.info)
            options.onError && options.onError(new Error(res.data.info), res.data)
            return
        }

        options.onSuccess && options.onSuccess({
            ...res.data,
            url: res.data.url || res.data.file_url
        })
    } catch (e) {
        if (e instanceof AxiosError) {
            options.onError && options.onError(e, e.response?.data)
        }
        if (e instanceof Error) {
            options.onError && options.onError({
                name: e.name,
                message: e.message,
                method: options.method,
                url: options.action
            })
        }
        throw e
    }
}

export type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export function getBase64(file: FileType): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    })
}

/**
 * 计算文件MD5
 * https://github.com/quansitech/file-md5-wasm/blob/master/js/calc_file_hash.js
 * @param file
 */
export function calc_file_hash(file: File) {
    const MD5_RANGE_SIZE = 10 * 1024 * 1024;
    const CUT_LIMIT = 40 * 1024 * 1024;

    function makeMd5Range(fileSize: number) {
        if (CUT_LIMIT > fileSize) {
            return [[0, fileSize]];
        }

        // MD5_RANGE_SIZE设置为10
        const first = [0.0, MD5_RANGE_SIZE];
        const last = [fileSize - MD5_RANGE_SIZE, fileSize];

        // 中间段算法
        const rangeMod = fileSize - 3.0 * MD5_RANGE_SIZE;
        const midStart = fileSize % rangeMod;
        const middle = [MD5_RANGE_SIZE + midStart, MD5_RANGE_SIZE + midStart + MD5_RANGE_SIZE];

        return [first, middle, last];
    }

    return new Promise<string>(function (resolve, reject) {
        const fileSize = file.size;
        const range = makeMd5Range(fileSize);

        let index = 0;
        const hash = md5.create();// 创建MD5哈希对象

        const reader = new FileReader();

        reader.onload = function (e) {
            // 处理当前分块的读取结果
            const chunkData = e.target?.result;

            hash.update(chunkData as string); // 更新哈希计算结果

            if (index < range.length - 1) {
                index++;
                readNextChunk(range, index);
            } else {
                const fileMD5 = hash.hex(); // 计算文件的最终MD5哈希值

                resolve(fileMD5);
            }
        };

        reader.onerror = function (e) {
            reject(e);

        };

        function readNextChunk(chunkRange: number[][], index: number) {
            const chunk = file.slice(chunkRange[index][0], chunkRange[index][1]);
            reader.readAsArrayBuffer(chunk);
        }

        readNextChunk(range, index);
    });

}

export async function beforeUpload(file: File & {
    hash_id?: string,
}, fileList: UploadFile[], allFileList: UploadFile[]) {
    file.hash_id = await calc_file_hash(file)
    const f = allFileList.filter((item: QsUploadFile) => !!item.hash_id).find((item: QsUploadFile) => item.hash_id === file.hash_id)
    if (f) {
        message.error(file.name + '文件已上传')
        return Upload.LIST_IGNORE
    }
}
