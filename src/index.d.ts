import * as React from 'rax';
import spine from "./spine-canvas.js";
interface SpineInfo {
    atlas: string;
    skel: string;
    png: string;
    animName: string;
    top: number;
    left: number;
    size: {
        width: number;
        height: number;
    };
    noClear?: boolean;
    loop?: boolean;
    delay?: number;
    onAnimFinish?: () => void;
}
interface StateInfo {
}
declare class Spine extends React.Component<SpineInfo, StateInfo> {
    lastFrameTime: number;
    canvas: any;
    context: any;
    skeleton: spine.Skeleton;
    spineState: spine.AnimationState;
    frameHandler: any;
    assetManager: any;
    skeletonRenderer: any;
    stoped: boolean;
    bounds: {
        offset: spine.Vector2;
        size: spine.Vector2;
    };
    constructor(props: any);
    componentDidMount(): void;
    shouldComponentUpdate(newProps: SpineInfo): boolean;
    componentDidUpdate(preProps: any): void;
    componentWillUnmount(): void;
    removeSpineAsset: (asset: any) => void;
    tryClearWithProps: (props: any) => void;
    init: () => void;
    loadSkeleton: () => {
        skeleton: any;
        state: any;
        bounds: {
            offset: any;
            size: any;
        };
    };
    calculateBounds: (skeleton: any) => {
        offset: any;
        size: any;
    };
    renderAnim: () => void;
    resize: () => void;
    render(): JSX.Element;
}
export default Spine;
