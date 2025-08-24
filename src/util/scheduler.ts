const NGAScheduler = {
    schedule: (interval: number, fn: () => void) => {
        setInterval(() => {
            fn();
        }, interval);
    }
}

export default NGAScheduler;