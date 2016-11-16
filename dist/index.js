"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
function hello() {
    return __awaiter(this, void 0, void 0, function* () {
        return 'a';
    });
}
exports.hello = hello;
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 10; i++) {
            yield hello();
        }
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
class A {
    get name() {
        return "a";
    }
}
exports.A = A;
//# sourceMappingURL=index.js.map