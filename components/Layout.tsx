import {MenuDataItem, PageContainer, ProLayout} from "@ant-design/pro-components";
import {App, Dropdown, Menu, Space} from "antd";
import type {LayoutProps} from "./LayoutContext";
import {LayoutContext} from "./LayoutContext";
import {useEffect, useState} from "react";
import {usePage} from "@inertiajs/react";
import {routerNavigateTo} from "../lib/helpers";
import {MenuInfo} from "rc-menu/lib/interface";
import http from "../lib/http";
// @ts-ignore
import {Route} from '@ant-design/pro-layout/lib/typing';
import global from "../lib/global";
import assign from "lodash/assign";

export default function ({children}: {
    children: React.ReactNode
}) {

    const pageProps = usePage<{
        layoutProps: LayoutProps,
    }>().props

    const layoutProps = pageProps.layoutProps
    const {modal, notification, message} = App.useApp()

    const [props, setProps] = useState<LayoutProps>({
        title: '',
        metaTitle: '',
        topMenuActiveKey: '',
        menuActiveKey: '',
        loading: false,
        topMenu: [],
        menuList: [],
        logo: '',
        userMenu: [],
    })

    const assignProps = (newProps: LayoutProps) => {
        setProps(assign(props, newProps))
    }

    const headerContentRender = () => {
        return <>
            <Menu items={props.topMenu}
                  mode={'horizontal'}
                  activeKey={props.topMenuActiveKey}
            />
        </>
    }

    const [openKeys, setOpenKeys] = useState<string[]>([])
    const [pageTitle, setPageTitle] = useState<string>('')
    const [route, setRoute] = useState<Route>()

    useEffect(() => {
        function findKeyPath(key: string, list: MenuDataItem[]): string[] {
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                if (item.key === key) {
                    return [item.key]
                } else if (item.children?.length) {
                    const path = findKeyPath(key, item.children)
                    if (path?.length) {
                        return [item.key as string, ...path]
                    }
                }
            }
            return []
        }

        if (!props.menuActiveKey) {
            return
        }
        setOpenKeys(findKeyPath(props.menuActiveKey, props.menuList || []))

    }, [props.menuActiveKey]);

    useEffect(() => {
        if (pageProps.layoutProps?.menuActiveKey) {
            assignProps({
                menuActiveKey: pageProps.layoutProps.menuActiveKey
            })
        }

        const title = props.title || layoutProps.title
        if (pageProps.layoutProps?.metaTitle) {
            setPageTitle(pageProps.layoutProps.metaTitle + ' - ' + title)
            assignProps({
                metaTitle: pageProps.layoutProps.metaTitle + ' - ' + title
            })
        } else {
            setPageTitle(title as string)
            assignProps({
                metaTitle: title
            })
        }
    }, [pageProps]);


    useEffect(() => {
        console.log(pageProps)

        global.modal = modal
        global.notification = notification
        global.message = message

        setProps({
            title: layoutProps.title || '',
            metaTitle: '',
            topMenuActiveKey: layoutProps.topMenuActiveKey,
            menuActiveKey: layoutProps.menuActiveKey,
            loading: false,
            topMenu: layoutProps.topMenu,
            menuList: layoutProps.menuList,
            logo: layoutProps.logo,
            userMenu: layoutProps.userMenu,
        })

        const r = {
            key: '/',
            routes: layoutProps.menuList?.map(menu => {
                return {
                    name: menu.name,
                    key: menu.key,
                    children: menu.children?.map(child => {
                        return {
                            name: child.name,
                            key: child.key
                        }
                    })
                }
            })
        }

        setRoute(r)

    }, [])


    const onMenuClick = (info: MenuInfo) => {
        const keyPath = info.keyPath.reverse()
        let menu: MenuDataItem | undefined = props.menuList?.find(menu => menu.key === keyPath[0]);
        for (let i = 1; i < keyPath.length; i++) {
            menu = menu?.children?.find(m => m.key === keyPath[i])
        }
        if (menu?.path) {
            assignProps({
                loading: true
            })
            routerNavigateTo(menu.path, {
                onSuccess() {
                    assignProps({
                        menuActiveKey: info.key
                    })
                },
                onFinish() {
                    assignProps({
                        loading: false
                    })
                }
            })
        }
    }

    return <>
        <LayoutContext.Provider value={{
            assignProps,
            props,
        }}>
            <ProLayout title={props.title}
                       loading={props.loading}
                       layout="mix"
                       route={route}
                       fixSiderbar={true}
                       logo={props.logo}
                       headerContentRender={headerContentRender}
                       pageTitleRender={p => pageTitle}
                       footerRender={() => <>
                           <Space>
                               <a href="https://www.quansitech.com/" target={'_blank'}>全思科技</a>
                               <a href="https://github.com/quansitech/" target={'_blank'}>Github</a>
                           </Space>
                       </>}
                       avatarProps={{
                           title: 'admin',
                           render(p, dom) {
                               return <>
                                   <Dropdown menu={{
                                       items: props.userMenu?.map(menu => {
                                           return {
                                               label: menu.title,
                                               key: menu.url,
                                               onClick() {
                                                   switch (menu.type) {
                                                       case 'open':
                                                           window.open(menu.url)
                                                           break;
                                                       case 'nav':
                                                           routerNavigateTo(menu.url)
                                                           break
                                                       case 'ajax':
                                                           http.get(menu.url).then(() => {
                                                               window.location.reload()
                                                           })
                                                           break
                                                   }
                                               }
                                           }
                                       }) || [],
                                   }}>
                                       {dom}
                                   </Dropdown>
                               </>
                           }
                       }}
                       menuProps={{
                           activeKey: props.menuActiveKey as string,
                           selectedKeys: [props.menuActiveKey as string],
                           openKeys: openKeys,
                           onClick: onMenuClick,
                           onOpenChange: setOpenKeys
                       }}
            >

                <PageContainer title={props.metaTitle}>
                    <div>{children}</div>
                </PageContainer>
            </ProLayout>
        </LayoutContext.Provider>
    </>
}
