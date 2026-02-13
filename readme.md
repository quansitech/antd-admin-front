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

## 常用扩展功能

### 弹窗（Modal）使用

框架提供了 `modalShow` 函数用于显示弹窗，支持在弹窗中嵌套 Table、Form、Tabs 等组件。

#### 基本用法

```tsx
import {modalShow} from "@quansitech/antd-admin/lib/helpers";

// 显示弹窗
await modalShow({
    title: '弹窗标题',
    content: {
        type: 'form',  // 支持 'form' | 'table' | 'tabs'
        props: {
            // 传递给组件的 props
        },
        url: '/api/modal-content'  // 可选：从 URL 获取弹窗内容
    },
    contexts: {
        // 传递给弹窗的上下文数据
        tableContext,
        customData: 'value'
    }
})
```

#### 在弹窗中使用上下文

弹窗内的组件通过 `ModalContext` 访问上下文：

```tsx
import {ModalContext} from "@quansitech/antd-admin/components/ModalContext";

export default function MyComponent() {
    const modalContext = useContext(ModalContext)

    // 关闭弹窗
    const close = () => {
        modalContext.closeModal()
    }

    // 设置关闭后的回调
    modalContext.setAfterClose(() => {
        console.log('弹窗已关闭')
    })

    // 访问传递的上下文数据
    const tableContext = modalContext.contexts?.tableContext

    return <div>弹窗内容</div>
}
```

#### 支持的弹窗类型

- **form**: 表单弹窗，组件路径 `Modal.Form`
- **table**: 表格弹窗，组件路径 `Modal.Table`
- **tabs**: 标签页弹窗，组件路径 `Modal.Tabs`

#### 自定义弹窗组件

```tsx
// 1. 创建弹窗组件
import {ModalContext} from "@quansitech/antd-admin/components/ModalContext";

export default function CustomModal({title, data}: any) {
    const modalContext = useContext(ModalContext)

    return (
        <div>
            <h2>{title}</h2>
            <p>{data}</p>
            <Button onClick={modalContext.closeModal}>关闭</Button>
        </div>
    )
}

// 2. 注册弹窗组件
import container from "@quansitech/antd-admin/lib/container";

container.register('Modal.Custom', () => import('./components/CustomModal'))

// 3. 使用自定义弹窗
await modalShow({
    content: {
        type: 'custom',
        props: {
            title: '自定义弹窗',
            data: 'some data'
        }
    }
})
```

### 页面跳转

框架提供了 `routerNavigateTo` 函数用于页面跳转，基于 Inertia.js 实现。

#### 基本用法

```tsx
import {routerNavigateTo} from "@quansitech/antd-admin/lib/helpers";

// 简单跳转
routerNavigateTo('/admin/user')

// 带配置的跳转
routerNavigateTo('/admin/user', {
    onSuccess: () => {
        console.log('跳转成功')
    },
    onError: (errors) => {
        console.error('跳转失败', errors)
    },
    preserveState: true,  // 保留页面状态
    replace: false  // 不替换历史记录
})
```

#### 在组件中使用

```tsx
// 按钮点击跳转
<Button onClick={() => routerNavigateTo('/admin/create')}>
    新建
</Button>

// JavaScript 协议链接（会使用 window.location.href）
routerNavigateTo('javascript:history.back()')
```

### 消息提示

框架通过 `global` 对象提供了消息提示功能，包括成功、错误、警告、信息等提示。

#### 使用方式

```tsx
import global from "@quansitech/antd-admin/lib/global";

// 成功提示
global.notification.success({
    message: '操作成功',
    description: '数据已保存'
})

// 错误提示
global.notification.error({
    message: '操作失败',
    description: '请稍后重试'
})

// 警告提示
global.notification.warning({
    message: '警告',
    description: '请注意检查数据'
})

// 信息提示
global.notification.info({
    message: '提示信息'
})

// 简单消息提示
global.message.success('保存成功')
global.message.error('保存失败')
global.message.warning('请检查输入')
global.message.info('提示信息')
global.message.loading('加载中...')
```

#### HTTP 自动消息处理

HTTP 拦截器会自动处理后端返回的消息：

```tsx
// 后端返回格式
{
    status: 1,  // 1=成功, 0=失败
    info: '操作成功',  // 会自动显示提示
    url: '/admin/list'  // 可选：自动跳转
}

// 前端请求
await http({url: '/api/save'})
// 会自动显示成功/失败提示
// 如果返回 url，2秒后自动跳转
```

#### 禁用自动消息

```tsx
await http({
    url: '/api/data',
    fetchOptions: {
        noHandle: true  // 不自动处理消息和跳转
    }
})
```

### 确认框（Confirm）

在需要用户确认的操作时使用确认框。

#### 在 Action 组件中使用

```tsx
// Table Action
{
    title: '删除',
    request: {
        url: '/admin/delete/__id__',
        method: 'post',
        confirm: '确定要删除这条记录吗？'  // 显示确认框
    }
}

// Form Action
{
    title: '保存',
    submit: true,
    confirm: '确定要保存吗？'  // 提交前确认
}
```

#### 手动使用确认框

```tsx
import {Modal} from "antd";

Modal.confirm({
    title: '确认操作',
    content: '确定要执行此操作吗？',
    onOk() {
        console.log('确认')
    },
    onCancel() {
        console.log('取消')
    }
})
```

### HTTP 请求

框架封装了 `http` 实例，基于 Axios，提供了统一的请求处理。

#### 基本用法

```tsx
import http from "@quansitech/antd-admin/lib/http";

// GET 请求
const res = await http({
    method: 'get',
    url: '/api/user/list'
})

// POST 请求
const res = await http({
    method: 'post',
    url: '/api/user/create',
    data: {
        name: '张三',
        email: 'test@example.com'
    }
})

// 带请求头
const res = await http({
    method: 'post',
    url: '/api/data',
    headers: {
        'X-Custom-Header': 'value'
    },
    data: {}
})
```

#### 参数替换

支持使用 `__field__` 格式进行动态参数替换：

```tsx
// URL 参数替换
const url = replaceUrl('/admin/user/edit/__id__', {id: 123})
// 结果: '/admin/user/edit/123'

// 请求参数替换
const data = replaceParams({
    name: '__username__',
    age: '__userage__'
}, {username: '张三', userage: 25})
// 结果: {name: '张三', age: 25}
```

#### 错误处理

```tsx
try {
    await http({
        method: 'post',
        url: '/api/save',
        data: {}
    })
} catch (error) {
    // 错误会自动显示通知
    // 这里可以添加额外处理
    console.error('保存失败', error)
}
```

### 树形数据处理

框架提供了多个树形数据处理的工具函数。

#### treeToList - 树形转列表

```tsx
import {treeToList} from "@quansitech/antd-admin/lib/helpers";

const tree = [
    {
        id: 1,
        name: '节点1',
        children: [
            {id: 11, name: '子节点1.1', children: []},
            {id: 12, name: '子节点1.2', children: []}
        ]
    },
    {
        id: 2,
        name: '节点2',
        children: []
    }
]

const list = treeToList(tree, 'children')
// 结果: [{id:1, name:'节点1'}, {id:11, name:'子节点1.1'}, {id:12, name:'子节点1.2'}, {id:2, name:'节点2'}]
```

#### diffTree - 对比树形差异

```tsx
import {diffTree} from "@quansitech/antd-admin/lib/helpers";

const oldTree = [{id: 1, name: 'A', children: []}]
const newTree = [{id: 1, name: 'A', children: []}, {id: 2, name: 'B', children: []}]

const added = diffTree(oldTree, newTree, 'children')
// 结果: [{id: 2, name: 'B'}] - 新增的节点
```

#### findValuePath - 查找值路径

```tsx
import {findValuePath} from "@quansitech/antd-admin/lib/helpers";

const obj = {
    a: {
        b: {
            c: 'target'
        }
    }
}

const path = findValuePath(obj, 'target')
// 结果: ['a', 'b', 'c']
```

#### getValueByPath - 根据路径取值

```tsx
import {getValueByPath} from "@quansitech/antd-admin/lib/helpers";

const obj = {a: {b: {c: 'value'}}}

const value = getValueByPath(obj, ['a', 'b', 'c'])
// 结果: 'value'
```

### 条件判断

使用 `handleCondition` 函数进行条件判断：

```tsx
import {handleCondition} from "@quansitech/antd-admin/lib/helpers";

// 支持的操作符
const conditions = [
    {field: 'age', operator: '>', value: 18},  // gt, gte, lt, lte
    {field: 'status', operator: '=', value: 1},   // eq, neq
    {field: 'type', operator: 'in', value: [1, 2, 3]},  // in, not in
]

const data = {age: 20, status: 1, type: 2}

conditions.forEach(cond => {
    const result = handleCondition(cond, data)
    console.log(`条件${cond.field} ${cond.operator} ${cond.value}:`, result)
})
```

### Context 使用

框架提供了多个 Context 用于在不同组件间共享数据。

#### TableContext

表格上下文，提供表格相关的操作：

```tsx
import {TableContext} from "@quansitech/antd-admin/components/TableContext";

const tableContext = useContext(TableContext)

// 重新加载表格
await tableContext.getActionRef()?.reload()

// 获取选中的行
const selectedRows = tableContext.getSelectedRows()

// 清空选中
tableContext.getActionRef()?.clearSelected()

// 获取编辑的值
const editedValues = tableContext.getEditedValues()

// 获取数据源
const dataSource = tableContext.getDataSource()

// 获取表格配置
const tableProps = tableContext.getTableProps()
```

#### FormContext

表单上下文，提供表单相关的操作：

```tsx
import {FormContext} from "@quansitech/antd-admin/components/FormContext";

const formContext = useContext(FormContext)

// 获取表单引用
const formRef = formContext.getFormRef()

// 获取表单值
const values = await formRef?.getFieldsValue()

// 设置表单值
formRef?.setFieldsValue({name: '张三'})

// 重置表单
formRef?.resetFields()

// 提交表单
formRef?.submit()
```

#### ModalContext

弹窗上下文，提供弹窗相关的操作：

```tsx
import {ModalContext} from "@quansitech/antd-admin/components/ModalContext";

const modalContext = useContext(ModalContext)

// 是否在弹窗中
const inModal = modalContext.inModal

// 关闭弹窗
modalContext.closeModal()

// 设置关闭后的回调
modalContext.setAfterClose(() => {
    console.log('弹窗关闭后执行')
})

// 访问传递的上下文
const contexts = modalContext.contexts
```

### 完整示例

#### 表格操作按钮

```tsx
// 后端配置
{
    title: '操作',
    actions: [
        {
            type: 'Button',  // 使用自定义按钮组件
            props: {
                type: 'primary',
                title: '编辑',
                relateSelection: false,  // 不关联选中行
                link: {
                    url: '/admin/edit/__id__'  // 跳转链接
                }
            }
        },
        {
            type: 'Button',
            props: {
                type: 'default',
                title: '审核',
                request: {
                    url: '/admin/audit',
                    method: 'post',
                    data: {id: '__id__'},
                    confirm: '确定要审核通过吗？'  // 确认框
                }
            }
        },
        {
            type: 'Button',
            props: {
                type: 'default',
                title: '查看详情',
                modal: {
                    title: '详情',
                    content: {
                        type: 'form',
                        url: '/admin/detail/__id__'
                    }
                }
            }
        },
        {
            type: 'Button',
            props: {
                type: 'primary',
                title: '批量删除',
                relateSelection: true,  // 关联选中行
                request: {
                    url: '/admin/batch-delete',
                    method: 'post',
                    confirm: '确定要删除选中的记录吗？'
                }
            }
        }
    ]
}
```

#### 表单操作按钮

```tsx
// 后端配置
{
    title: '操作',
    actions: [
        {
            type: 'Button',
            props: {
                title: '保存',
                submit: true  // 提交表单
            }
        },
        {
            type: 'Button',
            props: {
                title: '保存并新增',
                request: {
                    url: '/admin/save',
                    method: 'post',
                    afterAction: ['tableReload', 'closeModal']  // 操作后执行
                }
            }
        },
        {
            type: 'Button',
            props: {
                title: '重置',
                reset: true  // 重置表单
            }
        },
        {
            type: 'Button',
            props: {
                title: '返回',
                back: true  // 返回上一页
            }
        },
        {
            type: 'Button',
            props: {
                title: '打开子表单',
                modal: {
                    title: '子表单',
                    content: {
                        type: 'form',
                        url: '/admin/subform/__id__'
                    }
                }
            }
        }
    ]
}
```

## 更新日志

### 1.3.0 (2026-02-11)

**新增功能**
- **Table 组件优化**：添加表格默认搜索值初始化和加载状态处理
- **树形数据处理**：新增树形数据处理工具函数（`treeToList`、`diffTree`、`findValuePath`、`getValueByPath`）
- **布局组件优化**：优化布局组件的渲染逻辑和用户体验

**Bug 修复**
- 修复 Cascader 组件值比较逻辑问题
- 修复表格搜索 URL 处理逻辑
- 修复文件上传组件的 multiple 属性判断逻辑

### 1.2.0 (2025-09-29)

**新增功能**
- **SelectText 组件**：新增键值对输入组件，支持灵活的数据输入方式
- **Table 组件增强**：
  - 添加表格描述功能
  - 增加日期范围搜索功能
  - 优化列处理逻辑和搜索表单初始值处理
- **File 组件增强**：支持多文件选择上传功能
- **类型支持**：添加 scss 模块声明文件支持

**组件优化**
- 优化 SelectText 组件样式与功能
- 优化 textarea 渲染逻辑
- 优化上传组件的校验逻辑

### 1.1.0 (2024-11-14)

**新增功能**
- **Composer 包自动注册**：支持自动分析并注册 Composer 包中的组件
- **Table 组件增强**：
  - 添加表格树型结构支持
  - 增加表格右侧操作的数据字段渲染功能
  - 新增 Link 表格组件
  - 支持选项设置、隐藏列配置及行宽设置
- **Form 组件增强**：
  - 新增 Dependency 表单项，支持依赖项处理
  - 新增 formList 表单列表组件
  - 提交失败后自动滚动到第一个错误表单项
- **Layout 组件优化**：
  - 新增 Layout Replacement 组件，支持单独变更属性
  - 支持自定义 headerActions 和 footer
- **文件上传增强**：增加图片裁剪质量选项
- **主题支持**：添加暗黑模式切换功能

**组件优化**
- 优化级联初始化机制和省市区组件
- 增加注入自定义组件验证
- 优化文件上传请求，统一文件名后缀大小写
- 添加 hidden 字段适配
- 优化布局组件并添加自定义路由映射
- 添加 useWindowResize 自定义钩子处理窗口大小变化

**类型支持**
- 将 lodash 引入方式改为花括号形式，优化打包体积
- 增加引入部分类型定义

