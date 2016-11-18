import * as Immutable from 'immutable';

export default {
    shouldComponentUpdate: function (nextProps: any, nextState: any) {
        // 以下代码逻辑来自： https://zhuanlan.zhihu.com/p/2029597 @camsong

        const currentProps = this.props;
        const currentState = this.state;
        
        if (Object.keys(currentProps).length != Object.keys(nextProps).length ||
            Object.keys(currentState).length != Object.keys(nextState).length
        ) {
            return true;
        }

        for (const key in nextProps) {
            if (currentProps[key] !== nextProps[key] || 
                !Immutable.is(currentProps[key], nextProps[key])
            ) {
                return true;
            }
        }

        for (const key in nextState) {
            if (currentState[key] !== nextState[key] || 
                !Immutable.is(currentState[key], nextState[key])
            ) {
                return true;
            }
        }

        return false;
    }
}