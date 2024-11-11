import {MenuDataItem, PageContainer, ProConfigProvider, ProLayout} from "@ant-design/pro-components";
import {Button, Dropdown, Menu, Space} from "antd";
import type {LayoutProps} from "../LayoutContext";
import {LayoutContext} from "../LayoutContext";
import React, {useEffect, useRef, useState} from "react";
import {routerNavigateTo} from "../../lib/helpers";
import {MenuInfo} from "rc-menu/lib/interface";
import http from "../../lib/http";
// @ts-ignore
import {Route} from '@ant-design/pro-layout/lib/typing';
import {MoonOutlined, SunOutlined} from "@ant-design/icons";

export default function ({children, pageTitle, siteTitle, pageProps}: {
    children: React.ReactNode,
    pageTitle: string,
    siteTitle: string,
    pageProps: any
}) {

    const layoutProps = pageProps.layoutProps
    const contentRef = useRef<HTMLDivElement>(null)

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
    const [theme, setTheme] = useState<'light' | 'realDark'>('light')

    const assignProps = (newProps: LayoutProps) => {
        setProps(Object.assign(props, newProps))
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
            assignProps({
                metaTitle: pageProps.layoutProps.metaTitle + ' | ' + title
            })
        } else {
            assignProps({
                metaTitle: title
            })
        }
    }, [pageProps.layoutProps]);


    useEffect(() => {

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

        // 设置内容高度
        function onResize() {
            if (contentRef.current) {
                contentRef.current.style.minHeight = Math.max(window.innerHeight - 200, 200) + 'px'
            }
        }

        onResize()
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }

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

    const actionsRender = () => <>
        <Space>
            <Button type={'text'} onClick={() => {
                setTheme(theme === 'light' ? 'realDark' : 'light')
            }}>
                {theme === 'realDark' ? <MoonOutlined/> : <SunOutlined/>}
            </Button>
        </Space>
    </>

    return <>
        <LayoutContext.Provider value={{
            assignProps,
            props,
        }}>
            <ProConfigProvider dark={theme === 'realDark'}>
                <ProLayout title={siteTitle}
                           loading={props.loading}
                           layout="mix"
                           actionsRender={actionsRender}
                           route={route}
                           fixSiderbar={true}
                           logo={props.logo}
                           headerContentRender={headerContentRender}
                           pageTitleRender={p => `${pageTitle} | ${siteTitle} 后台管理`}
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

                    <PageContainer title={pageTitle}>
                        <div ref={contentRef}>{children}</div>
                    </PageContainer>
                </ProLayout>
            </ProConfigProvider>
        </LayoutContext.Provider>
    </>
}
