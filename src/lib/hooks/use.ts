import { useState, useEffect } from "react";
import { BehaviorSubject } from "rxjs";

export function use<S>(stream$: BehaviorSubject<S>): S {
    const [value, setValue] = useState(stream$.value);

    useEffect(() => {
        const sub = stream$.subscribe(setValue);
        return () => sub.unsubscribe();
    }, [stream$]);

    return value;
}