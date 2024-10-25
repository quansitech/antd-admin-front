import {schemaHandler} from "./schemaHandler";
import {routerNavigateTo} from "./helpers";

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

function autoRegister(prefix: string, components: Record<string, () => Promise<any>>) {
    for (const [key, value] of Object.entries(components)) {
        const name = key.split('/').pop()?.split('.').shift()
        container.register(prefix + name, value)
    }
}

// -------- 通用 -----------
{
    const columnRender = import.meta.glob('../components/Column/*.tsx')
    autoRegister('Column.', columnRender)

    // readonly render
    const columnReadonlyRender = import.meta.glob('../components/Column/Readonly/*.tsx')
    autoRegister('Column.Readonly.', columnReadonlyRender)
}

// -------- 弹窗 -----------
{
    container.register('Modal.Table', import('../components/Table'))
    container.register('Modal.Form', import('../components/Form'))
}

// -------- Tabs -----------
{
    container.register('Tab.Pane.Table', import('../components/Table'))
    container.register('Tab.Pane.Form', import('../components/Form'))
}

// -------- 表格 -----------
{
    // options render
    const optionsRender = import.meta.glob('../components/Table/Option/*.tsx')
    autoRegister('Table.Option.', optionsRender)

    // action render
    const actionRender = import.meta.glob('../components/Table/Action/*.tsx')
    autoRegister('Table.Action.', actionRender)
}

// -------- 表单 -----------
{

    // formAction render
    const formActionRender = import.meta.glob('../components/Form/Action/*.tsx')
    autoRegister('Form.Action.', formActionRender)
}


;((globalThis: any) => {
    if (globalThis.$qsContainer) {
        return;
    }

    globalThis.$qsContainer = container

})(window)

export default container