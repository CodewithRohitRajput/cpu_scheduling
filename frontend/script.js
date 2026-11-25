
let processes = [];

// Add process
function addProcess() {

    let pid = document.getElementById("pid").value;
    let arrival = Number(document.getElementById("arrival").value);
    let burst = Number(document.getElementById("burst").value);
    let priority = Number(document.getElementById("priority").value);

    if (pid === "" ||
        document.getElementById("arrival").value === "" ||
        document.getElementById("burst").value === "" ||
        document.getElementById("priority").value === "") {

        alert("Please fill all fields");
        return;
    }

    if (processes.some(p => p.pid === pid)) {
        alert("PID must be unique");
        return;
    }

    if (arrival < 0 || burst <= 0) {
        alert("Invalid arrival or burst time");
        return;
    }

    processes.push({
        pid: pid,
        arrival: arrival,
        burst: burst,
        priority: priority
    });

    displayProcesses();

    document.getElementById("pid").value = "";
    document.getElementById("arrival").value = "";
    document.getElementById("burst").value = "";
    document.getElementById("priority").value = "";
}


// Display processes
function displayProcesses() {

    let table = document.getElementById("processTable");

    table.innerHTML = "";

    processes.forEach((p, index) => {

        table.innerHTML += `
            <tr>
                <td>${p.pid}</td>
                <td>${p.arrival}</td>
                <td>${p.burst}</td>
                <td>${p.priority}</td>
                <td>
                    <button onclick="removeProcess(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;

    });
}


// Remove process
function removeProcess(index) {

    processes.splice(index, 1);

    displayProcesses();
}


// FCFS Algorithm
function FCFS() {

    let p = processes.map(process => ({...process}));

    p.sort((a, b) => a.arrival - b.arrival);

    let time = 0;
    let gantt = [];
    let results = [];

    for (let process of p) {

        if (time < process.arrival) {

            gantt.push({
                pid: "IDLE",
                start: time,
                end: process.arrival
            });

            time = process.arrival;
        }

        let start = time;

        time = time + process.burst;

        let ct = time;
        let tat = ct - process.arrival;
        let wt = tat - process.burst;
        let rt = start - process.arrival;

        gantt.push({
            pid: process.pid,
            start: start,
            end: time
        });

        results.push({
            pid: process.pid,
            ct: ct,
            tat: tat,
            wt: wt,
            rt: rt
        });

    }

    return {
        gantt: gantt,
        results: results
    };
}


// SJF Algorithm - Non Preemptive
function SJF() {

    let p = processes.map(process => ({...process}));

    let completed = [];
    let gantt = [];
    let results = [];

    let time = 0;

    while (completed.length < p.length) {

        let available = p.filter(process =>
            !completed.includes(process.pid) &&
            process.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(...p
                .filter(process => !completed.includes(process.pid))
                .map(process => process.arrival));

            gantt.push({
                pid: "IDLE",
                start: time,
                end: next
            });

            time = next;
            continue;
        }

        // Find process with smallest burst time
        available.sort((a, b) => a.burst - b.burst);

        let process = available[0];

        let start = time;

        time += process.burst;

        let ct = time;
        let tat = ct - process.arrival;
        let wt = tat - process.burst;
        let rt = start - process.arrival;

        completed.push(process.pid);

        gantt.push({
            pid: process.pid,
            start: start,
            end: time
        });

        results.push({
            pid: process.pid,
            ct: ct,
            tat: tat,
            wt: wt,
            rt: rt
        });

    }

    return {
        gantt: gantt,
        results: results
    };
}


// Priority Scheduling - Non Preemptive
function PRIORITY() {

    let p = processes.map(process => ({...process}));

    let completed = [];
    let gantt = [];
    let results = [];

    let time = 0;

    while (completed.length < p.length) {

        let available = p.filter(process =>
            !completed.includes(process.pid) &&
            process.arrival <= time
        );

        if (available.length === 0) {

            let next = Math.min(...p
                .filter(process => !completed.includes(process.pid))
                .map(process => process.arrival));

            gantt.push({
                pid: "IDLE",
                start: time,
                end: next
            });

            time = next;
            continue;
        }

        // Smaller priority number = higher priority
        available.sort((a, b) => a.priority - b.priority);

        let process = available[0];

        let start = time;

        time += process.burst;

        let ct = time;
        let tat = ct - process.arrival;
        let wt = tat - process.burst;
        let rt = start - process.arrival;

        completed.push(process.pid);

        gantt.push({
            pid: process.pid,
            start: start,
            end: time
        });

        results.push({
            pid: process.pid,
            ct: ct,
            tat: tat,
            wt: wt,
            rt: rt
        });

    }

    return {
        gantt: gantt,
        results: results
    };
}


// Round Robin Algorithm
function RR(quantum) {

    let p = processes.map(process => ({
        ...process,
        remaining: process.burst,
        firstStart: -1
    }));

    p.sort((a, b) => a.arrival - b.arrival);

    let queue = [];
    let gantt = [];
    let results = [];

    let time = 0;
    let index = 0;
    let completed = 0;

    while (completed < p.length) {

        // Add arrived processes to queue
        while (index < p.length && p[index].arrival <= time) {

            queue.push(p[index]);

            index++;
        }

        // If queue is empty, CPU is idle
        if (queue.length === 0) {

            let next = p[index].arrival;

            gantt.push({
                pid: "IDLE",
                start: time,
                end: next
            });

            time = next;
            continue;
        }

        let process = queue.shift();

        if (process.firstStart === -1) {
            process.firstStart = time;
        }

        let start = time;

        let runTime = Math.min(quantum, process.remaining);

        time += runTime;

        process.remaining -= runTime;

        gantt.push({
            pid: process.pid,
            start: start,
            end: time
        });

        // Add newly arrived processes
        while (index < p.length && p[index].arrival <= time) {

            queue.push(p[index]);

            index++;
        }

        if (process.remaining === 0) {

            let ct = time;
            let tat = ct - process.arrival;
            let wt = tat - process.burst;
            let rt = process.firstStart - process.arrival;

            results.push({
                pid: process.pid,
                ct: ct,
                tat: tat,
                wt: wt,
                rt: rt
            });

            completed++;

        } else {

            queue.push(process);

        }

    }

    return {
        gantt: gantt,
        results: results
    };
}


// Main simulation function
function simulate() {

    if (processes.length === 0) {
        alert("Please add processes first");
        return;
    }

    let algorithm = document.getElementById("algorithm").value;

    let result;

    if (algorithm === "FCFS") {

        result = FCFS();

    }

    else if (algorithm === "SJF") {

        result = SJF();

    }

    else if (algorithm === "PRIORITY") {

        result = PRIORITY();

    }

    else if (algorithm === "RR") {

        let quantum = Number(document.getElementById("quantum").value);

        if (!Number.isInteger(quantum) || quantum <= 0) {
            alert("Enter a valid time quantum");
            return;
        }

        result = RR(quantum);

    }

    displayGantt(result.gantt);

    displayResults(result.results);

    displayAverage(result.results);
}


// Display Gantt Chart
function displayGantt(gantt) {

    let chart = document.getElementById("gantt");

    chart.innerHTML = "";

    gantt.forEach(item => {

        let block = document.createElement("div");

        block.className = item.pid === "IDLE" ? "block idle" : "block";

        block.innerHTML = `
            <b>${item.pid}</b><br>
            ${item.start} - ${item.end}
        `;

        chart.appendChild(block);

    });

}


// Display metrics table
function displayResults(results) {

    let table = document.getElementById("resultTable");

    table.innerHTML = "";

    results.forEach(p => {

        table.innerHTML += `
            <tr>
                <td>${p.pid}</td>
                <td>${p.ct}</td>
                <td>${p.tat}</td>
                <td>${p.wt}</td>
                <td>${p.rt}</td>
            </tr>
        `;

    });

}


// Calculate and display averages
function displayAverage(results) {

    let totalWT = 0;
    let totalTAT = 0;
    let totalRT = 0;

    results.forEach(p => {

        totalWT += p.wt;
        totalTAT += p.tat;
        totalRT += p.rt;

    });

    let n = results.length;

    let avgWT = totalWT / n;
    let avgTAT = totalTAT / n;
    let avgRT = totalRT / n;

    document.getElementById("average").innerHTML = `
        <p>Average Waiting Time: ${avgWT.toFixed(2)}</p>
        <p>Average Turnaround Time: ${avgTAT.toFixed(2)}</p>
        <p>Average Response Time: ${avgRT.toFixed(2)}</p>
    `;

}
