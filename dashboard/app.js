// Connect to ROS using rosbridge_websocket
const ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
});

const statusSpan = document.getElementById('connection-status');

ros.on('connection', () => {
    console.log('Connected to websocket server.');
    statusSpan.textContent = 'Connected';
    statusSpan.classList.add('text-success');
});

ros.on('error', (error) => {
    console.log('Error connecting to websocket server: ', error);
    statusSpan.textContent = 'Error connecting to ROS Bridge';
    statusSpan.classList.add('text-danger');
});

ros.on('close', () => {
    console.log('Connection to websocket server closed.');
    statusSpan.textContent = 'Disconnected';
    statusSpan.classList.add('text-warning');
});

// Helper function to update UI elements with color coding
function updateStateElement(elementId, value, normalVal, warningVal, criticalVal) {
    const el = document.getElementById(elementId);
    el.textContent = value;
    el.className = ''; // reset
    if (value === normalVal) el.classList.add('status-normal');
    else if (value === warningVal) el.classList.add('status-warning');
    else el.classList.add('status-critical');
}

// ----------------------------------------------------------------
// Subscriptions
// ----------------------------------------------------------------

// 1. Safe Command Velocity
const safeCmdListener = new ROSLIB.Topic({
    ros: ros,
    name: '/safe_cmd_vel',
    messageType: 'geometry_msgs/Twist'
});
safeCmdListener.subscribe((message) => {
    document.getElementById('vel-linear').textContent = message.linear.x.toFixed(2);
    document.getElementById('vel-angular').textContent = message.angular.z.toFixed(2);
});

// 2. Driver State
const driverStateListener = new ROSLIB.Topic({
    ros: ros,
    name: '/driver_state',
    messageType: 'std_msgs/String'
});
driverStateListener.subscribe((message) => {
    updateStateElement('driver-state', message.data, 'NORMAL', 'DROWSY', 'EMERGENCY');
});

// 3. Alcohol State
const alcoholStateListener = new ROSLIB.Topic({
    ros: ros,
    name: '/alcohol_interlock_state',
    messageType: 'std_msgs/String'
});
alcoholStateListener.subscribe((message) => {
    updateStateElement('alcohol-state', message.data, 'DRIVE_ENABLED', '', 'DRIVE_DISABLED');
});

// 4. Gas State
const gasStateListener = new ROSLIB.Topic({
    ros: ros,
    name: '/gas_state',
    messageType: 'std_msgs/String'
});
gasStateListener.subscribe((message) => {
    try {
        const data = JSON.parse(message.data);
        updateStateElement('gas-state', data.status, 'SAFE', '', 'LEAK_DETECTED');
    } catch(e) {}
});

// 5. Door State
const doorStateListener = new ROSLIB.Topic({
    ros: ros,
    name: '/door_state',
    messageType: 'std_msgs/String'
});
doorStateListener.subscribe((message) => {
    // Both UNLOCKED and LOCKED are technically normal, but we color UNLOCKED green and LOCKED orange for visibility
    updateStateElement('door-state', message.data, 'UNLOCKED', 'LOCKED', 'ERROR');
});

// 6. Cabin State
const cabinStateListener = new ROSLIB.Topic({
    ros: ros,
    name: '/cabin_state',
    messageType: 'std_msgs/String'
});
cabinStateListener.subscribe((message) => {
    try {
        const data = JSON.parse(message.data);
        updateStateElement('cabin-state', data.status, 'NORMAL', 'WARNING', 'CRITICAL');
    } catch(e) {}
});

// 7. World State (just counting objects)
const worldStateListener = new ROSLIB.Topic({
    ros: ros,
    name: '/world_state',
    messageType: 'std_msgs/String'
});
worldStateListener.subscribe((message) => {
    try {
        const data = JSON.parse(message.data);
        document.getElementById('world-objects').textContent = data.tracked_objects ? data.tracked_objects.length : 0;
    } catch(e) {}
});

// 8. Hardware logs
function logHardware(msg) {
    const logEl = document.getElementById('hardware-log');
    const time = new Date().toLocaleTimeString();
    logEl.textContent = `[${time}] ${msg}\n` + logEl.textContent;
}

const engineCutListener = new ROSLIB.Topic({ ros: ros, name: '/hardware/engine_cut', messageType: 'std_msgs/Bool' });
engineCutListener.subscribe((msg) => { if(msg.data) logHardware('CRITICAL: ENGINE POWER CUT!'); });

const windowsCmdListener = new ROSLIB.Topic({ ros: ros, name: '/hardware/windows_cmd', messageType: 'std_msgs/String' });
windowsCmdListener.subscribe((msg) => { logHardware(`WINDOWS CMD: ${msg.data}`); });

const hazardsCmdListener = new ROSLIB.Topic({ ros: ros, name: '/hardware/hazards_cmd', messageType: 'std_msgs/Bool' });
hazardsCmdListener.subscribe((msg) => { if(msg.data) logHardware('HAZARDS ACTIVATED'); });
