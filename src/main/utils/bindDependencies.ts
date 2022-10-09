import { container } from 'tsyringe';

function bindDependencies(token: symbol, func: Function) {
    return (...args: any[]) => func(container.resolve(token), ...args);
}

export default bindDependencies;
