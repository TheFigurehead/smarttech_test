import { MainProcess } from './src/MainProcess';
(async () => {
    const process = new MainProcess();
    await process.init();
})();