import * as Immutable from 'immutable';

export function isImmutableData(obj: any) {
    return !!obj && (
        obj instanceof Immutable.Map ||
        obj instanceof Immutable.List ||
        obj instanceof Immutable.Set ||
        obj instanceof Immutable.Seq ||
        obj instanceof Immutable.Record ||
        obj instanceof Immutable.Stack ||
        obj instanceof Immutable.OrderedMap ||
        obj instanceof Immutable.OrderedSet ||
        obj instanceof Immutable.Seq.Indexed ||
        obj instanceof Immutable.Iterable
    );
}
