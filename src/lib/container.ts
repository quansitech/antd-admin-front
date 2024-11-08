import {schemaHandler} from "./schemaHandler";
import {routerNavigateTo} from "./helpers";
import Table from "../components/Table";
import Form from "../components/Form";

const components: Record<string, any> = {}

const container = {
    register(name: string, componentLoader: any) {
        if (this.check(name)) {
            throw new Error(`Component ${name} already registered`)
        }
        components[name] = componentLoader
    },
    get(name: string) {
        if (!this.check(name)) {
            throw new Error(`Component ${name} is not registered`)
        }
        return components[name]
    },
    check(name: string) {
        return !!components[name]
    },
    schemaHandler,
    routerNavigateTo,
};

function autoRegister(prefix: string, components: Record<string, (() => Promise<any>) | any>) {
    for (const [key, value] of Object.entries(components)) {
        const name = key.split('/').pop()?.split('.').shift()
        container.register(prefix + name, value.default)
    }
}

// -------- 通用 -----------
{
    //todo const columnRender = import.meta.glob('../components/Column/*.tsx', {eager: true})
    const columnRender = []
    autoRegister('Column.', columnRender)

    // readonly render
    //todo const columnReadonlyRender = import.meta.glob('../components/Column/Readonly/*.tsx', {eager: true})
    const columnReadonlyRender = []
    autoRegister('Column.Readonly.', columnReadonlyRender)
}

// -------- 弹窗 -----------
{
    container.register('Modal.Table', Table)
    container.register('Modal.Form', Form)
}

// -------- Tabs -----------
{
    container.register('Tab.Pane.Table', Table)
    container.register('Tab.Pane.Form', Form)
}

// -------- 表格 -----------
{
    // column.action render
    //todo const optionsRender = import.meta.glob('../components/Column/Readonly/Action/*.tsx', {eager: true})
    const optionsRender = []
    autoRegister('Column.Readonly.Action.', optionsRender)

    // action render
    // todo const actionRender = import.meta.glob('../components/Table/Action/*.tsx', {eager: true})
    const actionRender = []
    autoRegister('Table.Action.', actionRender)
}

// -------- 表单 -----------
{

    // formAction render
    // todo const formActionRender = import.meta.glob('../components/Form/Action/*.tsx', {eager: true})
    const formActionRender = []
    autoRegister('Form.Action.', formActionRender)
}

export default container