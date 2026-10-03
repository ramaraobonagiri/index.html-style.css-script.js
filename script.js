// ==========================================
// CAMPUSPULSE AI
// Main JavaScript
// ==========================================


// -------------------------------
// DATA
// -------------------------------

let reports = JSON.parse(localStorage.getItem("campusReports")) || [
    {
        id: "CP-1024",
        title: "Water leakage near Block B",
        category: "Water",
        location: "Block B",
        priority: "High",
        status: "In Progress"
    },
    {
        id: "CP-1023",
        title: "Internet problem in laboratory",
        category: "Internet",
        location: "Laboratory",
        priority: "Medium",
        status: "Reported"
    }
];

let selectedUrgency = "Medium";


// -------------------------------
// NAVIGATION
// -------------------------------

function scrollToReport() {
    document.getElementById("report").scrollIntoView({
        behavior: "smooth"
    });
}


// -------------------------------
// URGENCY BUTTONS
// -------------------------------

document.querySelectorAll(".urgency-btn").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll(".urgency-btn")
            .forEach(btn => btn.classList.remove("active"));

        this.classList.add("active");

        selectedUrgency = this.dataset.value;

    });

});


// -------------------------------
// AI CATEGORY DETECTION
// -------------------------------

function detectCategory(text) {

    text = text.toLowerCase();

    if (
        text.includes("water") ||
        text.includes("leak") ||
        text.includes("tap") ||
        text.includes("pipe")
    ) {
        return "Water";
    }

    if (
        text.includes("light") ||
        text.includes("electric") ||
        text.includes("fan") ||
        text.includes("power")
    ) {
        return "Electricity";
    }

    if (
        text.includes("wifi") ||
        text.includes("internet") ||
        text.includes("network")
    ) {
        return "Internet";
    }

    if (
        text.includes("clean") ||
        text.includes("garbage") ||
        text.includes("waste") ||
        text.includes("dust")
    ) {
        return "Cleanliness";
    }

    if (
        text.includes("danger") ||
        text.includes("security") ||
        text.includes("unsafe")
    ) {
        return "Safety";
    }

    return "Infrastructure";
}


// -------------------------------
// AI PRIORITY
// -------------------------------

function calculatePriority(description, urgency) {

    let text = description.toLowerCase();

    let score = 0;

    // Urgency score

    if (urgency === "High") {
        score += 50;
    }

    if (urgency === "Medium") {
        score += 30;
    }

    if (urgency === "Low") {
        score += 10;
    }

    // Keyword analysis

    const highKeywords = [
        "danger",
        "fire",
        "accident",
        "electric",
        "shock",
        "leak",
        "security",
        "unsafe"
    ];

    highKeywords.forEach(word => {

        if (text.includes(word)) {
            score += 10;
        }

    });


    if (score >= 60) {
        return {
            level: "High",
            score: Math.min(score, 98)
        };
    }

    if (score >= 30) {
        return {
            level: "Medium",
            score: Math.min(score, 75)
        };
    }

    return {
        level: "Low",
        score: Math.max(score, 25)
    };

}


// -------------------------------
// DUPLICATE DETECTION
// -------------------------------

function findSimilarReports(title, category, location) {

    const titleWords = title
        .toLowerCase()
        .split(" ")
        .filter(word => word.length > 3);

    let matches = 0;

    reports.forEach(report => {

        const sameCategory = report.category === category;
        const sameLocation = report.location === location;

        const matchingWords = titleWords.filter(word =>
            report.title.toLowerCase().includes(word)
        );

        if (
            sameCategory &&
            sameLocation &&
            matchingWords.length >= 1
        ) {
            matches++;
        }

    });

    return matches;

}


// -------------------------------
// GENERATE TICKET
// -------------------------------

function generateTicket() {

    const number = Math.floor(
        1000 + Math.random() * 9000
    );

    return "CP-" + number;

}


// -------------------------------
// SUBMIT ISSUE
// -------------------------------

document.getElementById("issueForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const title =
            document.getElementById("issueTitle").value;

        const selectedCategory =
            document.getElementById("category").value;

        const location =
            document.getElementById("location").value;

        const description =
            document.getElementById("description").value;


        // AI category

        let category = selectedCategory;

        if (category === "Auto") {

            category = detectCategory(
                title + " " + description
            );

        }


        // AI priority

        const priority =
            calculatePriority(
                description + " " + title,
                selectedUrgency
            );


        // Duplicate detection

        const similar =
            findSimilarReports(
                title,
                category,
                location
            );


        // Ticket

        const ticket =
            generateTicket();


        // Save

        const newReport = {

            id: ticket,
            title: title,
            category: category,
            location: location,
            priority: priority.level,
            status: "Reported"

        };

        reports.push(newReport);

        localStorage.setItem(
            "campusReports",
            JSON.stringify(reports)
        );


        // Display result

        showAIResult(
            ticket,
            category,
            location,
            priority,
            similar
        );


        updateDashboard();


        // Scroll to result

        document.getElementById("aiResult")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

    });


// -------------------------------
// SHOW AI RESULT
// -------------------------------

function showAIResult(
    ticket,
    category,
    location,
    priority,
    similar
) {

    const result =
        document.getElementById("aiResult");

    let priorityClass =
        priority.level.toLowerCase();

    result.innerHTML = `

        <div class="generated-result">

            <div class="ticket">
                ${ticket}
            </div>

            <h3>
                ✓ Issue successfully analyzed
            </h3>

            <div class="result-box">

                <span>AI Category</span>

                <strong>
                    ${category}
                </strong>

            </div>

            <div class="result-box">

                <span>Location</span>

                <strong>
                    ${location}
                </strong>

            </div>

            <div class="result-box">

                <span>AI Priority</span>

                <strong class="priority-${priorityClass}">
                    ${priority.level.toUpperCase()}
                    · ${priority.score}/100
                </strong>

            </div>

            <div class="result-box">

                <span>Status</span>

                <strong>
                    Reported
                </strong>

            </div>

            <div class="similar">

                ✦ AI Similarity Check

                <br><br>

                ${
                    similar > 0
                    ? `${similar} similar report(s) found.`
                    : "No similar reports found."
                }

            </div>

            <br>

            <p style="color:#969ba8;font-size:13px">

                Save your ticket ID
                <strong>${ticket}</strong>
                to track your issue later.

            </p>

        </div>

    `;

}


// -------------------------------
// TRACK TICKET
// -------------------------------

function trackTicket() {

    const input =
        document.getElementById("ticketInput")
            .value
            .trim()
            .toUpperCase();

    const result =
        document.getElementById("trackingResult");


    const report =
        reports.find(
            item => item.id === input
        );


    if (!report) {

        result.innerHTML = `

            <div class="tracking-card">

                ❌ Ticket not found.

                <br><br>

                Try:

                <strong>CP-1024</strong>

            </div>

        `;

        return;

    }


    result.innerHTML = `

        <div class="tracking-card">

            <h3>${report.title}</h3>

            <br>

            <p>
                Ticket:
                <strong>${report.id}</strong>
            </p>

            <p>
                Category:
                ${report.category}
            </p>

            <p>
                Location:
                ${report.location}
            </p>

            <p>
                Priority:
                <strong>${report.priority}</strong>
            </p>

            <div class="timeline">

                <div>
                    ✓ Report submitted
                </div>

                <div>
                    ${
                        report.status === "Reported"
                        ? "● Waiting for assignment"
                        : "✓ Assigned to campus team"
                    }
                </div>

                <div>
                    ${
                        report.status === "In Progress"
                        ? "● Currently being resolved"
                        : "○ Resolution pending"
                    }
                </div>

                <div>
                    ○ Issue resolved
                </div>

            </div>

        </div>

    `;

}


// -------------------------------
// DASHBOARD
// -------------------------------

function updateDashboard() {

    const total =
        document.getElementById("totalReports");

    const hero =
        document.getElementById("heroReports");

    if (total) {
        total.textContent =
            126 + reports.length;
    }

    if (hero) {
        hero.textContent =
            126 + reports.length;
    }

}


// -------------------------------
// CHARTS
// -------------------------------

const categoryData = {

    labels: [
        "Infrastructure",
        "Water",
        "Internet",
        "Cleanliness",
        "Electricity",
        "Safety"
    ],

    datasets: [{
        label: "Reports",
        data: [34, 24, 21, 18, 17, 14],
        borderWidth: 0
    }]

};


new Chart(
    document.getElementById("categoryChart"),
    {
        type: "bar",

        data: categoryData,

        options: {

            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true
                }

            }

        }

    }
);


new Chart(
    document.getElementById("statusChart"),
    {

        type: "doughnut",

        data: {

            labels: [
                "Resolved",
                "In Progress",
                "Reported"
            ],

            datasets: [{

                data: [
                    94,
                    18,
                    16
                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }

            }

        }

    }

);


// -------------------------------
// INITIAL UPDATE
// -------------------------------

updateDashboard();
