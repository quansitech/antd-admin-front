import {MenuDataItem, PageContainer, ProLayout, ProProvider} from "@ant-design/pro-components";
import {Button, Dropdown, Menu, MenuProps, Space} from "antd";
import {LayoutContext, LayoutProps} from "../LayoutContext";
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {routerNavigateTo} from "../../lib/helpers";
import {MenuInfo} from "rc-menu/lib/interface";
import http from "../../lib/http";
// @ts-ignore
import {Route} from '@ant-design/pro-layout/lib/typing';
import {MoonOutlined, SunOutlined} from "@ant-design/icons";
import {usePage} from "@inertiajs/react";
import './New.scss';

export default function ({children, pageTitle, setDarkMode}: {
    children: React.ReactNode,
    pageTitle: string,
    siteTitle: string,
    setDarkMode: (darkMode: boolean) => void
}) {
    const contentRef = useRef<HTMLDivElement>(null)
    const layoutContext = useContext(LayoutContext)
    const pageProps = usePage<any>().props
    const layoutProps: LayoutProps = useMemo(() => {
        return {
            ...layoutContext.props
        }
    }, [layoutContext.props])

    const assignProps = layoutContext.assignProps

    const headerContentRender = () => {
        return <>
            <Menu items={layoutContext.props.topMenu}
                  mode={'horizontal'}
                  activeKey={layoutContext.props.topMenuActiveKey}
            />
        </>
    }

    const [openKeys, setOpenKeys] = useState<string[]>([])
    const [route, setRoute] = useState<any>({
        key: '/',
        routes: layoutContext.props.menuList?.map(menu => {
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
    })
    useEffect(() => {
        setRoute({
            key: '/',
            routes: layoutContext.props.menuList?.map(menu => {
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
        })
    }, [layoutContext.props.menuList])

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

        if (!layoutContext.props.menuActiveKey) {
            return
        }
        setOpenKeys(findKeyPath(layoutContext.props.menuActiveKey, layoutContext.props.menuList || []))

    }, [layoutContext.props.menuActiveKey]);

    useCallback(() => {
        if (pageProps.layoutProps?.menuActiveKey) {
            assignProps({
                menuActiveKey: pageProps.layoutProps.menuActiveKey
            })
        }

        const title = layoutContext.props.title || layoutProps.title
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
        let menu: MenuDataItem | undefined = layoutContext.props.menuList?.find(menu => menu.key === keyPath[0]);
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

    const proContext = useContext(ProProvider)

    const actionsRender = () => {
        return <>
            <Space>
                <Button type={'text'} onClick={() => {
                    setDarkMode(!proContext.dark)
                }}>
                    {proContext.dark ? <MoonOutlined/> : <SunOutlined/>}
                </Button>
            </Space>
        </>
    }

    return <>
        <ProLayout title={layoutProps.title}
                   loading={layoutContext.props.loading}
                   layout="mix"
                   actionsRender={actionsRender}
                   route={route}
                   fixSiderbar={true}
                   logo={layoutContext.props.logo}
                   headerContentRender={headerContentRender}
                   pageTitleRender={p => `${pageTitle} | ${layoutProps.title} 后台管理`}
                   footerRender={() => <>
                       {layoutProps.footer !== undefined
                           ? <>{layoutProps.footer}</>
                           : <Space>
                               <a href="https://www.quansitech.com/" target={'_blank'}>全思科技</a>
                               <a href="https://github.com/quansitech/" target={'_blank'}>Github</a>
                           </Space>
                       }
                   </>}
                   avatarProps={{
                       title: layoutProps.userName,
                       render(p, dom) {
                           return <>
                               <Dropdown menu={{
                                   items: layoutContext.props.userMenu?.map(menu => {
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
                       activeKey: layoutContext.props.menuActiveKey as string,
                       selectedKeys: [layoutContext.props.menuActiveKey as string],
                       openKeys: openKeys,
                       onClick: onMenuClick,
                       onOpenChange: setOpenKeys
                   } as MenuProps}
        >

            <PageContainer title={pageTitle}>
                <div ref={contentRef}>{children}</div>
            </PageContainer>
        </ProLayout>
    </>
}
