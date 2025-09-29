declare global {
    interface Window {
        UE: any,
        UE_LOADING_PROMISE: any,
    }
}


declare module "*.module.scss" {
    const content: { [className: string]: string };
    export default content;
}