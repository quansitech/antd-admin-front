export type TableActionProps = {
    type: string,
    title: string,
    props?: Record<string, any>,
    relateSelection?: boolean,
    badge?: string | number,
}