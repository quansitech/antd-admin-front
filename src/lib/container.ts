import {schemaHandler} from "./schemaHandler";
import {routerNavigateTo} from "./helpers";
import column from '../components/Column';
import columnReadonly from '../components/Column/Readonly';
import columnReadonlyAction from '../components/Column/Readonly/Action/index';
import tableAction from '../components/Table/Action';
import formAction from '../components/Form/Action';
import {lazy} from "react";
import {lowerFirst} from "lodash";

const components: Record<string, any> = {}

const container = {
    register(name: string, componentLoader: any) {
        if (this.check(name)) {
            throw new Error(`Component ${name} already registered`)
        }
        components[name] = lazy(componentLoader)
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
    list(prefix: string) {
        prefix = prefix.replace(/\.$/, '')
        const keys = Object.keys(components)
            .filter(key => {
                return key.match(new RegExp(`^${prefix}\\.\\w+$`))
            })
            .map(key => key.replace(new RegExp(`^${prefix}\\.`), ''))

        return keys.reduce((acc, key) => {
            acc[lowerFirst(key)] = this.get(prefix + '.' + key)
            return acc
        }, {} as Record<string, any>)
    },
    schemaHandler,
    routerNavigateTo,
};

async function autoRegister(prefix: string, components: Record<string, any>) {
    for (const [key, value] of Object.entries(components)) {
        const name = key.split('/').pop()?.split('.').shift()
        container.register(prefix + name, value)
    }
}

// -------- 通用 -----------
{
    autoRegister('Column.', column)

    // readonly render
    autoRegister('Column.Readonly.', columnReadonly)
}

// -------- 弹窗 -----------
{
    container.register('Modal.Table', () => import('../components/Table'))
    container.register('Modal.Form', () => import('../components/Form'))
    container.register('Modal.Tabs', () => import('../components/Tabs'))
}

// -------- Tabs -----------
{
    container.register('Tab.Pane.Table', () => import('../components/Table'))
    container.register('Tab.Pane.Form', () => import('../components/Form'))
}

// -------- 表格 -----------
{
    // column.action render
    autoRegister('Column.Readonly.Action.', columnReadonlyAction)

    // action render
    autoRegister('Table.Action.', tableAction)
}

// -------- 表单 -----------
{

    // formAction render
    autoRegister('Form.Action.', formAction)
}

export default container