import {Alert, Button, Spin, Tooltip, Upload, UploadFile, UploadProps} from "antd";
import React, {ReactNode, useContext, useEffect, useState} from "react";
import {beforeUpload, customRequest} from "../../lib/upload";
import {ColumnProps} from "./types";
import {UploadListType} from "antd/es/upload/interface";
import {DndContext, DragEndEvent, PointerSensor, useSensor} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {FormContext} from "../FormContext";
import {TableContext} from "../TableContext";
import { ItemContext } from "../../lib/FormList";


interface DraggableUploadListItemProps {
    originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    file: UploadFile<any>;
}

const DraggableUploadListItem = ({originNode, file}: DraggableUploadListItemProps) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: file.uid,
    } as any);

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
        height: '100%',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // prevent preview event when drag end
            className={isDragging ? 'is-dragging' : ''}
            {...attributes}
            {...listeners}
        >
            {/* hide error tooltip when dragging */}
            {file.status === 'error' && isDragging ? originNode.props.children : originNode}
        </div>
    );
};


export default function (props: ColumnProps & {
    fieldProps?: {
        uploadRequest: {
            policyGetUrl: string,
        },
        maxCount?: number,
    }

    uploadButton?: (fileList: UploadFile[]) => ReactNode,
    listType?: UploadListType,
    onPreview?: (file: UploadFile) => Promise<void>,
    renderUploader?: (attr: {
        dom: JSX.Element,
    }) => ReactNode
}) {
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const formContext = useContext(FormContext);
    const tableContext = useContext(TableContext);
    const itemContext = useContext(ItemContext);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = URL.createObjectURL(file.originFileObj as File);
        }

        window.open(file.url || (file.preview as string))
    };

    useEffect(() => {
        if (loading) {
            return
        }
        const values = fileList.map(file => {
            if (file.status === 'done') {
                file.url = file.response.url || file.response.file_url
            }
            return file
        })
        
        props.fieldProps?.onChange(values.filter(file => file.status === 'done')
            .map((file: UploadFile) => {
                return file.response?.file_id
            }).join(','))
    }, [fileList]);

    useEffect(() => {
        let extraRenderValue = [];
        if (props.fieldProps?.extraRenderValue){
            extraRenderValue = props.fieldProps.extraRenderValue
        }
        if (props.fieldProps?.extraRenderValues){
            let index = -1;
            if (tableContext && tableContext?.dataSource){
                const key = tableContext.getTableProps().rowKey
                index = tableContext.dataSource.findIndex(item => item[key] === props.record[key])
            }
            if (itemContext && itemContext?.index !== undefined){
                index = itemContext.index
            }
            extraRenderValue = props.fieldProps.extraRenderValues[index] ?? []
        }
        if (!extraRenderValue.length) {
            setLoading(false)
            return
        }
        setFileList(extraRenderValue.map((item: any) => {
            return {
                uid: item.id,
                status: 'done',
                url: item.url,
                name: item.name,
                hash_id: item.hash_id,
                response: {
                    file_id: item.id,
                    url: item.url,
                }
            }
        }))

        setLoading(false)
    }, []);

    const uploadButton = (
        <Tooltip
            title={fileList.length >= (props.fieldProps?.maxCount || 1) ? '最多只能上传' + (props.fieldProps?.maxCount || 1) + '个文件' : ''}>
            <Button disabled={fileList.length >= (props.fieldProps?.maxCount || 1)}>上传文件</Button>
        </Tooltip>
    );

    const sensor = useSensor(PointerSensor, {
        activationConstraint: {distance: 10},
    });

    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const fieldProps = {...props.fieldProps}
    delete fieldProps.uploadRequest

    const uploader = (
        <Upload {...fieldProps}
                action={props.fieldProps.uploadRequest.policyGetUrl}
                listType={props.listType || 'text'}
                fileList={fileList}
                itemRender={(originNode, file) => (
                    <DraggableUploadListItem originNode={originNode} file={file}/>
                )}
                onPreview={props.onPreview || handlePreview}
                onChange={({fileList}) => setFileList(fileList)}
                beforeUpload={(f, fl) => beforeUpload(f, fl, fileList)}
                customRequest={customRequest as UploadProps['customRequest']}
        >
            {props.uploadButton ? props.uploadButton(fileList) : uploadButton}
        </Upload>
    )

    return <>
        {props.fieldProps?.uploadRequest
            ? <>
                <Spin spinning={loading}>
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                            {props.renderUploader ? props.renderUploader({dom: uploader}) : uploader}
                        </SortableContext>
                    </DndContext>
                    {<div style={{marginBottom: '16px'}}></div>}
                </Spin>
            </>
            : <>
                <Alert message={'缺少 uploadRequest 属性'}
                       type={"error"}/>
            </>
        }
    </>
}