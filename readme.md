# Qs-antd-admin

该项目作为qs-cmf的后台前端组件库，基于[ant-design-pro](https://procomponents.ant.design/components)

## 安装

```shell
npm install @quansitech/antd-admin
```

## 使用参考

### Layout组件Props

| 属性            | 替换组件          | 说明   | 类型        | 默认值           |
|---------------|---------------|------|-----------|---------------|
| headerActions | HeaderActions | 顶部操作 | ReactNode | -             |
| footer        | Footer        | 底部内容 | ReactNode | 全思科技 - Github |

可在项目目录 `/resources/js/backend/app.tsx` 中修改，如：

```tsx
createInertiaApp({
    resolve: async name => {
        const pages = import.meta.glob('./Pages/**/*.tsx')
        const page: any = await pages[`./Pages/${name}.tsx`]()
        page.default.layout = page.default.layout || ((page: ReactNode) => <Layout

                headerActions={<HeaderActions/>} //顶部操作
                footer={<>这是底部内容</>} // 底部内容

                children={page}/>
        )
        return page
    },
    //...
})
```

对于单独页面修改Layout组件属性，可在页面中调用对应的 Replacement 组件，如：

```tsx
import HeaderActions from "@quansitech/antd-admin/dist/components/Layout/Replacement/HeaderActions";

export default function () {

    return <>
        <HeaderActions>
            修改的内容
        </HeaderActions>
        页面内容
    </>
}

```

### valueType列表

参考 [ant-design-pro#valueType](https://procomponents.ant.design/components/schema#valuetype-%E5%88%97%E8%A1%A8)

## 自定义组件

对外暴露 [container](./lib/container.ts) 供外部调用

```ts
import container from "@quansitech/antd-admin/lib/container";

container.register('[组件名]', () => import('[组件路径]'));
```

### 通用

#### 通用Column Schema

- 组件名前缀：``` Column. ```
- 用途：表单项组件（非只读模式）、表格列编辑组件、表格搜索项组件
- 示例：

```tsx
// [组件.tsx]
import {ColumnProps} from "@quansitech/antd-admin/compontents/Column/types";

export default function (props: ColumnProps) {

    return <>
        组件内容
    </>
}

// [app.tsx]
import container from "@quansitech/antd-admin/lib/container";

container.register('Column.组件名', () => import('[组件路径]'));
```

- 若要补充组件库，请把组件放``` compontents/Column/ ``` 目录下

#### 只读Column Schema

- 组件名前缀：``` Column.Readonly. ```
- 用途：表单项组件（只读模式）、表格列组件
- 示例：

```tsx
// [组件.tsx]
import {ColumnProps} from "@quansitech/antd-admin/compontents/Column/Readonly/types";

export default function (props: ColumnProps) {

    return <>
        组件内容
    </>
}

// [app.tsx]
import container from "@quansitech/antd-admin/lib/container";

container.register('Column.Readonly.组件名', () => import('[组件路径]'));
```

- 若要补充组件库，请把组件放``` compontents/Column/Readonly/ ``` 目录下

### 表格Table

#### 工具栏操作组件

- 组件名前缀：``` Table.Column.Action. ```
- 示例：

```tsx
// [组件.tsx]

import {TableActionProps} from "@quansitech/antd-admin/compontents/Table/Action/types";

export default function (props: TableActionProps) {
    return <Button>{props.title}</Button>
}

// [app.tsx]

import container from "@quansitech/antd-admin/lib/container";

container.register('Table.Column.Action.组件名', () => import('[组件路径]'));

```

- 若要补充组件库，请把组件放``` compontents/Table/Action/ ``` 目录下

#### 行操作组件

- 组件名前缀：``` Table.Column.Option ```
- 示例：

```tsx
// [组件.tsx]

import {TableColumnOptionProps} from "@quansitech/antd-admin/compontents/Column/Readonly/Action/types";

export default function (props: TableColumnOptionProps) {
    <a onClick={onClick}>{props.title}</a>
}

// [app.tsx]

import container from "@quansitech/antd-admin/lib/container";

container.register('Column.Readonly.Action.组件名', () => import('[组件路径]'));

```

- 若要补充组件库，请把组件放``` compontents/Column/Readonly/Action/ ``` 目录下

## 更新日志

### 1.1.0

* 增加composer包注册组件机制


