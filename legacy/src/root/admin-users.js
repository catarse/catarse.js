import m from 'mithril';
import Elm from '../../../src/Page/Admin/Users.elm';

const adminUsers = {
    controller: function() {
        const startElmApp = (el, isInit) => {
            if (!isInit) {
                console.log('Elm is:', Elm);
                Elm.Main.embed(el);
            }
        };
    
        return {
            startElmApp
        };
    },
    view: function(ctrl) {
        return m('main#app', { config: ctrl.startElmApp });
    }
};

export default adminUsers;
