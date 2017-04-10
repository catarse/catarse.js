const root = document.getElementById('catarse_bootstrap'),
    data = root && root.getAttribute('data-settings');
const settingsVM = JSON.parse(data);

export default settingsVM;
