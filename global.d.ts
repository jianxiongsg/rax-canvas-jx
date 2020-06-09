declare namespace JSX{
    interface HTMLAttributes{
        children?:any;
        ref?:any;
    }
}

declare module '*.less'{
    interface IClassNames{
        [className:string]:string
    }
    const classNames:IClassNames;
    export = classNames
}