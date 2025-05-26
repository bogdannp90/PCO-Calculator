// --- Fraction Object (for rational arithmetic) ---
// ... (Fraction object and gcd function from previous response - unchanged) ...
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function Fraction(numerator, denominator = 1) {
    if (denominator === 0) {
        throw new Error("Denominator cannot be zero.");
    }
    if (typeof numerator === 'string') {
        if (numerator.includes('/')) {
            const parts = numerator.split('/');
            numerator = parseInt(parts[0]);
            denominator = parseInt(parts[1]);
        } else {
            const numFloat = parseFloat(numerator);
            if (!Number.isInteger(numFloat)) {
                let den = 1000000; // Max denominator for float conversion
                let num = Math.round(numFloat * den);
                const commonDivisor = gcd(num, den);
                numerator = num / commonDivisor;
                denominator = den / commonDivisor;
            } else {
                 numerator = numFloat;
                 denominator = 1;
            }
        }
    } else if (typeof numerator === 'number' && !Number.isInteger(numerator)) {
        let den = 1000000;
        let num = Math.round(numerator * den);
        const commonDivisor = gcd(num, den);
        numerator = num / commonDivisor;
        denominator = den / commonDivisor;
    }


    const common = gcd(numerator, denominator);
    this.num = numerator / common;
    this.den = denominator / common;

    if (this.den < 0) {
        this.num = -this.num;
        this.den = -this.den;
    }
}

Fraction.prototype.toString = function() {
    if (this.num === 0) return "0";
    if (this.den === 1) return this.num.toString();
    return `${this.num}/${this.den}`;
};

Fraction.prototype.valueOf = function() {
    return this.num / this.den;
};

Fraction.add = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    return new Fraction(fA.num * fB.den + fB.num * fA.den, fA.den * fB.den);
};

Fraction.subtract = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    return new Fraction(fA.num * fB.den - fB.num * fA.den, fA.den * fB.den);
};

Fraction.multiply = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    return new Fraction(fA.num * fB.num, fA.den * fB.den);
};

Fraction.divide = function(a, b) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    const fB = (b instanceof Fraction) ? b : new Fraction(b.toString());
    if (fB.num === 0) throw new Error("Division by zero fraction.");
    return new Fraction(fA.num * fB.den, fA.den * fB.num);
};

Fraction.abs = function(a) {
    const fA = (a instanceof Fraction) ? a : new Fraction(a.toString());
    return new Fraction(Math.abs(fA.num), fA.den);
}


// --- Helper Functions ---
function getElement(id) {
    return document.getElementById(id);
}

function clearResults() {
    getElement('resultsArea').innerHTML = '';
}

function appendHtml(htmlContent, areaId = 'resultsArea') {
    getElement(areaId).innerHTML += htmlContent;
}

function createTableHtml(headers, dataRows, caption, areaId = 'resultsArea') {
    let html = `<h4>${caption}</h4><table><thead><tr>`;
    headers.forEach(header => html += `<th>${header}</th>`);
    html += `</tr></thead><tbody>`;
    dataRows.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => {
            html += `<td>${(cell instanceof Fraction) ? cell.toString() : cell}</td>`
        });
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    appendHtml(html, areaId);
    return html; // also return for potential direct use
}

// --- Matrix Input Functions ---
const defaultMatrix = [ // 
    [4, 3, 2],
    [1, 5, 3],
    [2, 2, 4]
];

function setupMatrixInputs() {
    const numRows = parseInt(getElement('numRows').value);
    const numCols = parseInt(getElement('numCols').value);
    const table = getElement('matrixInputTable');
    table.innerHTML = ''; // Clear previous inputs

    // Create header row for Player B's strategies
    const headerRow = table.insertRow();
    headerRow.insertCell().outerHTML = "<th>A↓ | B→</th>"; // Corner cell
    for (let j = 0; j < numCols; j++) {
        headerRow.insertCell().outerHTML = `<th>b${j + 1}</th>`;
    }

    for (let i = 0; i < numRows; i++) {
        const row = table.insertRow();
        row.insertCell().outerHTML = `<th>a${i + 1}</th>`; // Player A's strategy label
        for (let j = 0; j < numCols; j++) {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'text'; // Use text to allow fractions like "5/2" later, or decimals
            input.id = `matrix_val_${i}_${j}`;
            input.size = 5;
            // Populate with default values if dimensions match, or use 0
            if (i < defaultMatrix.length && j < defaultMatrix[0].length &&
                numRows === defaultMatrix.length && numCols === defaultMatrix[0].length) {
                input.value = defaultMatrix[i][j];
            } else {
                input.value = "0"; // Default for new cells or different dimensions
            }
            cell.appendChild(input);
        }
    }
}

function getMatrixFromInputs() {
    const numRows = parseInt(getElement('numRows').value);
    const numCols = parseInt(getElement('numCols').value);
    const matrix = [];
    let allNumeric = true;

    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numCols; j++) {
            const inputVal = getElement(`matrix_val_${i}_${j}`).value;
            const num = parseFloat(inputVal); // Allow decimals for now, Simplex will use Fractions
            if (isNaN(num)) {
                allNumeric = false;
                break;
            }
            row.push(num); // Store as number, will be converted to Fraction later
        }
        if (!allNumeric) break;
        matrix.push(row);
    }

    if (!allNumeric) {
        alert("Please ensure all matrix inputs are valid numbers.");
        return null;
    }
    return matrix;
}


// --- Game Theory and LP Functions ---

function afiseazaMatriceJocHtml(gameMatrix) { // Now takes matrix as param
    const m = gameMatrix.length;
    const n = gameMatrix[0].length;
    const alpha = gameMatrix.map(row => Math.min(...row.map(val => parseFloat(val.toString())))); // Ensure numeric comparison
    const beta = [];
    for (let j = 0; j < n; j++) {
        let maxCol = parseFloat(gameMatrix[0][j].toString());
        for (let i = 1; i < m; i++) {
            if (parseFloat(gameMatrix[i][j].toString()) > maxCol) maxCol = parseFloat(gameMatrix[i][j].toString());
        }
        beta.push(maxCol);
    }

    let headers = ["", "A↓ | B→"];
    for (let j = 0; j < n; j++) headers.push(`b${j+1}`);
    headers.push("α = MIN linii");

    let dataRows = [];
    for (let i = 0; i < m; i++) {
        let row = [`x${i+1}`, `a${i+1}`];
        for (let j = 0; j < n; j++) row.push(new Fraction(gameMatrix[i][j].toString()));
        row.push(new Fraction(alpha[i].toString()));
        dataRows.push(row);
    }

    let betaRow = ["", "β = MAX coloane"];
    for (let j = 0; j < n; j++) betaRow.push(new Fraction(beta[j].toString()));
    betaRow.push(""); // Empty cell for alpha column
    dataRows.push(betaRow);

    createTableHtml(headers, dataRows, "Matricea de Joc Introdusă (Payoff pentru A)");

    const v1 = Math.max(...alpha);
    const v2 = Math.min(...beta);
    appendHtml(`<p>V1 (Maximin) = ${v1}</p>`);
    appendHtml(`<p>V2 (Minimax) = ${v2}</p>`);
    if (v1 === v2) {
        appendHtml(`<p style="color: green;">Punct șa găsit: V = ${v1}. Jocul are o soluție în strategii pure.</p>`);
    } else {
        appendHtml(`<p>V1 ≠ V2 (${v1} < ${v2}). Nu există punct șa. Se caută soluții în strategii mixte. Valoarea jocului V aparține [${v1}, ${v2}].</p>`);
    }
    return { v1: v1, v2: v2 };
}

function genereazaPlJocHtml(gameMatrix) { // Now takes matrix as param
    const numRows = gameMatrix.length; // Player A strategies
    const numCols = gameMatrix[0].length; // Player B strategies

    let html = `<h3>Problema de Programare Liniară pentru Jucătorul A (MIN)</h3>`;
    let fx = [];
    for (let i = 0; i < numRows; i++) fx.push(`x${i+1}`);
    html += `<p>Minimizăm: f(x) = ${fx.join(' + ')}</p>`;
    html += `<p>Restricții:</p><ul>`;
    for (let j = 0; j < numCols; j++) { // One restriction for each of Player B's strategies
        let restriction = [];
        for (let i = 0; i < numRows; i++) { // Sum over Player A's strategies
            restriction.push(`${new Fraction(gameMatrix[i][j].toString()).toString()} * x${i+1}`);
        }
        html += `<li>${restriction.join(' + ')} >= 1</li>`;
    }
    html += `<li>${fx.join(', ')} >= 0</li></ul>`;

    html += `<h3>Problema de Programare Liniară pentru Jucătorul B (MAX)</h3>`;
    let gy = [];
    for (let j = 0; j < numCols; j++) gy.push(`y${j+1}`);
    html += `<p>Maximizăm: g(y) = ${gy.join(' + ')}</p>`;
    html += `<p>Restricții:</p><ul>`;
    for (let i = 0; i < numRows; i++) { // One restriction for each of Player A's strategies
        let restriction = [];
        for (let j = 0; j < numCols; j++) { // Sum over Player B's strategies
            restriction.push(`${new Fraction(gameMatrix[i][j].toString()).toString()} * y${j+1}`);
        }
        html += `<li>${restriction.join(' + ')} <= 1</li>`;
    }
    html += `<li>${gy.join(', ')} >= 0</li></ul>`;
    appendHtml(html);
}

function rezolvaPLB_js(gameMatrix, v1Initial, v2Initial) { // Takes matrix as param
    appendHtml(`<h2>Algoritmul Simplex pentru Problema PLB (Jucătorul B - MAX)</h2>`);

    const numRows_A = gameMatrix.length;    // Strategies of Player A, becomes number of constraints for Player B's LP
    const numCols_B = gameMatrix[0].length; // Strategies of Player B, becomes number of decision variables for Player B's LP

    // Variables for Player B's LP: y1, ..., y_numCols_B (decision) and u1, ..., u_numRows_A (slack)
    const numDecisionVars_B = numCols_B;
    const numSlackVars_LP = numRows_A;
    const totalVars_LP = numDecisionVars_B + numSlackVars_LP;

    // Objective function for Player B: Max Z = y1 + y2 + ... + y_numCols_B
    let c_objective = [];
    for (let j = 0; j < numDecisionVars_B; j++) c_objective.push(new Fraction(1));
    for (let i = 0; i < numSlackVars_LP; i++) c_objective.push(new Fraction(0));

    // Initial Simplex Tableau
    // Each row corresponds to a constraint from Player A's strategies
    // gameMatrix[i][0]*y1 + ... + gameMatrix[i][numCols_B-1]*y_numCols_B + u_i+1 = 1
    let tableau = [];
    for (let i = 0; i < numRows_A; i++) { // For each strategy of Player A / each constraint
        let row = [];
        row.push(numDecisionVars_B + i); // Index of basic variable u_i+1 (0-indexed for slack array)
        row.push(new Fraction(0));       // CB for slack variable is 0
        row.push(new Fraction(1));       // XB (RHS of constraint) is 1

        // Coefficients for y_j decision variables
        for (let j = 0; j < numDecisionVars_B; j++) {
            row.push(new Fraction(gameMatrix[i][j].toString()));
        }
        // Coefficients for u_k slack variables
        for (let k = 0; k < numSlackVars_LP; k++) {
            row.push(new Fraction(i === k ? 1 : 0));
        }
        tableau.push(row);
    }

    let iteration = 0;
    const MAX_ITERATIONS = 25; // Safety break, increased slightly for larger matrices

    while (iteration < MAX_ITERATIONS) {
        let currentTableHeaders = ["B", "CB", "XB"];
        for(let j=0; j<numDecisionVars_B; j++) currentTableHeaders.push(`y${j+1}`);
        for(let j=0; j<numSlackVars_LP; j++) currentTableHeaders.push(`u${j+1}`);
        
        let currentTableData = tableau.map(row => {
            let displayRow = [...row];
            // displayRow[0] shows index, could be mapped to y_i or u_i for better readability
            let varName = "";
            if (row[0] < numDecisionVars_B) varName = `a`;
            else varName = `a`;
            displayRow[0] = `${varName}${row[0]}`;
            return displayRow;
        });
        createTableHtml(currentTableHeaders, currentTableData, `Tabelul Simplex ${iteration}`);


        let zj_vals = [];
        for (let j = 0; j < totalVars_LP; j++) {
            let zj = new Fraction(0);
            for (let i = 0; i < tableau.length; i++) { // tableau.length is numRows_A
                zj = Fraction.add(zj, Fraction.multiply(tableau[i][1], tableau[i][3 + j]));
            }
            zj_vals.push(zj);
        }

        let cj_zj_vals = [];
        for (let j = 0; j < totalVars_LP; j++) {
            cj_zj_vals.push(Fraction.subtract(c_objective[j], zj_vals[j]));
        }
        
        let z_current = new Fraction(0);
        for(let i=0; i<tableau.length; i++) {
            z_current = Fraction.add(z_current, Fraction.multiply(tableau[i][1], tableau[i][2]));
        }
        appendHtml(`<p>Z<sub>${iteration+1}</sub> = ${z_current.toString()}</p>`);


        let deltaRowHtml = `<tr><td><strong>Δk (Cj-Zj)</strong></td><td></td><td></td>`; // Adjusted colspan
        cj_zj_vals.forEach(val => deltaRowHtml += `<td>${val.toString()}</td>`);
        // Add empty cells if cj_zj_vals is shorter than headers (should not happen if totalVars_LP is correct)
        for(let k=cj_zj_vals.length; k < numDecisionVars_B + numSlackVars_LP; k++) deltaRowHtml += `<td></td>`;
        deltaRowHtml += `</tr>`;
        
        let resultsDiv = getElement('resultsArea');
        let tables = resultsDiv.getElementsByTagName('table');
        if (tables.length > 0) {
             tables[tables.length-1].querySelector('tbody').innerHTML += `<tr><td colspan="3"><strong>Δk (Cj-Zj)</strong></td>${cj_zj_vals.map(v => `<td>${v.toString()}</td>`).join('')}</tr>`;
        }

        let max_cj_zj = new Fraction(-Infinity);
        let pivotColIndex = -1; // This is the actual index in the tableau (0 to totalVars_LP-1)
        for (let j = 0; j < totalVars_LP; j++) {
            if (cj_zj_vals[j].valueOf() > 0 && cj_zj_vals[j].valueOf() > max_cj_zj.valueOf()) { // Stricter greater than 0 for entering
                max_cj_zj = cj_zj_vals[j];
                pivotColIndex = j;
            }
        }

        if (pivotColIndex === -1 || max_cj_zj.valueOf() <= 1e-9) { // Adding tolerance for float comparison from valueOf
            appendHtml("<p><strong>Toți Δk (Cj-Zj) <= 0 => Am găsit soluția optimă -> STOP Algoritm</strong></p>");
            break; 
        }
        
        let enteringVarName = pivotColIndex < numDecisionVars_B ? `y${pivotColIndex+1}` : `u${pivotColIndex - numDecisionVars_B + 1}`;
        appendHtml(`<p>Variabila care intră în bază (coloana pivot): ${enteringVarName} (index ${pivotColIndex}, Δk = ${max_cj_zj.toString()})</p>`);

        let minRatio = new Fraction(Infinity);
        let pivotRowIndex = -1;
        for (let i = 0; i < tableau.length; i++) {
            const A_ik = tableau[i][3 + pivotColIndex]; 
            if (A_ik.valueOf() > 1e-9) { // Tolerance for pivot element A_ik > 0
                const ratio = Fraction.divide(tableau[i][2] , A_ik);
                if (ratio.valueOf() >= 0 && ratio.valueOf() < minRatio.valueOf()) { // Ratio must be non-negative
                    minRatio = ratio;
                    pivotRowIndex = i;
                }
            }
        }

        if (pivotRowIndex === -1) {
            appendHtml("<p><strong>Problemă nelimitată (Unbounded Solution) - Nu s-a găsit nicio variabilă validă pentru a ieși din bază.</strong></p>");
            return {unbounded: true, g_max: null, tableau: tableau, c_objective: c_objective, cj_zj_vals: cj_zj_vals};
        }
        const pivotElement = tableau[pivotRowIndex][3 + pivotColIndex];
        let leavingVarIdx = tableau[pivotRowIndex][0];
        let leavingVarName = leavingVarIdx < numDecisionVars_B ? `y${leavingVarIdx+1}` : `u${leavingVarIdx - numDecisionVars_B + 1}`;

        appendHtml(`<p>Variabila care iese din bază (linia pivot): rândul ${pivotRowIndex+1} (variabila ${leavingVarName}, index ${leavingVarIdx})</p>`);
        appendHtml(`<p>Elementul pivot: ${pivotElement.toString()} (la intersecția rândului ${pivotRowIndex+1} cu coloana ${enteringVarName})</p>`);
        
        if (Math.abs(pivotElement.valueOf()) < 1e-9) {
             appendHtml("<p style='color:red;'><strong>EROARE: Elementul pivot este zero! Nu se poate continua. Verificați datele de intrare sau degenerare.</strong></p>");
             return { error: "Pivot element is zero.", g_max: z_current, tableau: tableau, c_objective: c_objective, cj_zj_vals: cj_zj_vals };
        }


        let newPivotRow = tableau[pivotRowIndex].map((val,idx) => {
            if (idx >=2) return Fraction.divide(val, pivotElement); 
            return val; 
        });
        newPivotRow[0] = pivotColIndex; 
        newPivotRow[1] = c_objective[pivotColIndex]; 
        tableau[pivotRowIndex] = newPivotRow;

        for (let i = 0; i < tableau.length; i++) {
            if (i !== pivotRowIndex) {
                const factor = tableau[i][3 + pivotColIndex]; 
                let updatedRow = tableau[i].map((oldVal, j) => {
                     if (j >= 2) { 
                        return Fraction.subtract(oldVal, Fraction.multiply(factor, tableau[pivotRowIndex][j]));
                     }
                     return oldVal; 
                });
                tableau[i] = updatedRow;
            }
        }
        iteration++;
         if (iteration >= MAX_ITERATIONS) {
            appendHtml("<p><strong>Numărul maxim de iterații atins.</strong></p>");
            break;
        }
    }

    // Recalculate final Z and Cj-Zj
    let g_max_final = new Fraction(0);
    tableau.forEach(row => {
        g_max_final = Fraction.add(g_max_final, Fraction.multiply(row[1], row[2]));
    });

    let final_cj_zj_vals = [];
    for (let j = 0; j < totalVars_LP; j++) {
        let zj = new Fraction(0);
        for (let i = 0; i < tableau.length; i++) {
            zj = Fraction.add(zj, Fraction.multiply(tableau[i][1], tableau[i][3 + j]));
        }
        final_cj_zj_vals.push(Fraction.subtract(c_objective[j], zj));
    }
    
    appendHtml(`<h4>Soluția Problemei PLB (Player B):</h4>`);
    appendHtml(`<p>MAX(g) = ${g_max_final.toString()} (${g_max_final.valueOf().toFixed(5)})</p>`);
    
    let y_B_solution = {};
    for(let j=0; j<numDecisionVars_B; j++) y_B_solution[`y${j+1}`] = new Fraction(0); 

    tableau.forEach(row => {
        const varIndex = row[0]; 
        if (varIndex < numDecisionVars_B) { 
            y_B_solution[`y${varIndex + 1}`] = row[2]; 
        }
    });
    
    let y_B_str_parts = [];
    for (let j=0; j < numDecisionVars_B; j++) {
        y_B_str_parts.push(`y${j+1} = ${y_B_solution[`y${j+1}`].toString()}`);
    }
    appendHtml(`<p>y_B (strategii auxiliare pentru B) = (${y_B_str_parts.join(', ')})</p>`);

    appendHtml(`<h4>Soluția Problemei PLA (Player A):</h4>`);
    appendHtml(`<p>MIN(f) = ${g_max_final.toString()} (valoarea problemei duale auxiliare)</p>`);
    
    let x_A_aux_solution = {};
    for (let i = 0; i < numSlackVars_LP; i++) { // numSlackVars_LP is numRows_A
        // Cj-Zj for slack variables (u1, u2, ..., u_numRows_A)
        // Slack u_k is at index (numDecisionVars_B + k) in c_objective and final_cj_zj_vals
        x_A_aux_solution[`x${i + 1}`] = Fraction.abs(final_cj_zj_vals[numDecisionVars_B + i]);
    }
    let x_A_aux_str_parts = [];
     for (let i=0; i < numSlackVars_LP; i++) { 
        x_A_aux_str_parts.push(`x${i+1} = ${x_A_aux_solution[`x${i+1}`].toString()}`);
    }
    appendHtml(`<p>x_A (strategii auxiliare pentru A) = (${x_A_aux_str_parts.join(', ')})</p>`);
    
    appendHtml(`<h4>Soluția Jocului:</h4>`);
    if (g_max_final.num === 0 && g_max_final.den !== 0) { // Check if g_max is exactly zero
        appendHtml("<p>Valoarea jocului auxiliar g_max este 0. </p>");
        // If g_max is 0, V = 1/0 is undefined. This can happen in certain games.
        // Or if the game is not strictly determined and requires shifting.
        // The current formulation assumes V > 0.
        // For now, we'll state the strategies found for the auxiliary problem.
        // A more robust solution might involve shifting the payoff matrix if g_max is not positive.
        if(v1Initial === 0 && v2Initial === 0) { // Special case if saddle point at 0
            appendHtml(`<p>Valoarea Jocului V = 0 (bazat pe V1=V2=0)</p>`);
            appendHtml(`<p>Strategiile optime trebuie determinate prin inspecție (strategii pure).</p>`);
        } else {
            appendHtml(`<p style="color:orange;">Valoarea jocului auxiliar g_max este 0. Formula V = 1/g_max nu se poate aplica direct. Acest algoritm presupune o valoare a jocului pozitivă după transformare. Considerați adăugarea unei constante la toate elementele matricii dacă valoarea jocului este non-pozitivă.</p>`);
        }
        return { error: "g_max is zero", g_max: g_max_final, x_A_aux: x_A_aux_solution, y_B_aux: y_B_solution};
    }
     if (g_max_final.num === 0) { // More general check for g_max being zero.
        appendHtml("<p style='color:red;'>Valoarea funcției obiectiv g_max este zero. Nu se poate calcula V = 1/g_max.</p>");
        return { error: "g_max is zero for V calculation." };
    }


    const V_game = Fraction.divide(new Fraction(1), g_max_final);
    appendHtml(`<p>V (Valoarea Jocului) = 1 / g_max = 1 / ${g_max_final.toString()} = ${V_game.toString()} (${V_game.valueOf().toFixed(5)})</p>`);

    let x_optimal_str_parts = [];
    for (let i = 0; i < numSlackVars_LP; i++) { // numRows_A strategies for Player A
        const x_opt_i = Fraction.multiply(x_A_aux_solution[`x${i+1}`], V_game);
        x_optimal_str_parts.push(`x${i+1}* = ${x_opt_i.toString()}`);
    }
    appendHtml(`<p>Strategia optimă pentru Jucătorul A: x*_opt = (${x_optimal_str_parts.join(', ')})</p>`);

    let y_optimal_str_parts = [];
    for (let j = 0; j < numDecisionVars_B; j++) { // numCols_B strategies for Player B
         const y_opt_j = Fraction.multiply(y_B_solution[`y${j+1}`], V_game);
         y_optimal_str_parts.push(`y${j+1}* = ${y_opt_j.toString()}`);
    }
    appendHtml(`<p>Strategia optimă pentru Jucătorul B: y*_opt = (${y_optimal_str_parts.join(', ')})<sup>T</sup></p>`);

    appendHtml(`<p>Verificare: Valoarea jocului V=${V_game.toString()} (${V_game.valueOf().toFixed(3)}). Intervalul inițial din matricea de joc: [${v1Initial}, ${v2Initial}].</p>`);
     if (V_game.valueOf() >= v1Initial - 1e-9 && V_game.valueOf() <= v2Initial + 1e-9) { // Added tolerance
        appendHtml(`<p style="color:green;">Valoarea jocului este în intervalul așteptat.</p>`);
    } else {
        appendHtml(`<p style="color:orange;">Atenție: Valoarea calculată a jocului (${V_game.valueOf().toFixed(5)}) este în afara intervalului inițial [${v1Initial}, ${v2Initial}]. Acest lucru se poate întâmpla dacă jocul original are o valoare non-pozitivă și nu s-a aplicat o translație a matricii pentru a asigura pozitivitatea înainte de rezolvarea LP-ului auxiliar. Algoritmul curent presupune că valoarea jocului V este pozitivă.</p>`);
    }
     return { V_game: V_game, g_max: g_max_final, x_opt: x_optimal_str_parts, y_opt: y_optimal_str_parts };
}


function runSolver() {
    clearResults();
    appendHtml("<h2>Procesul de Rezolvare</h2>");

    const gameMatrixNumeric = getMatrixFromInputs();
    if (!gameMatrixNumeric) {
        appendHtml("<p style='color:red;'>Rezolvare anulată din cauza datelor de intrare invalide.</p>");
        return;
    }
    
    // Convert to strings for Fraction consistency if needed, or use directly if Fraction handles numbers
    const gameMatrix = gameMatrixNumeric.map(row => row.map(val => val.toString()));


    const initialCheck = afiseazaMatriceJocHtml(gameMatrixNumeric); // Pass numeric for min/max
    genereazaPlJocHtml(gameMatrix); // Pass string version for Fraction display

    if (initialCheck.v1 === initialCheck.v2) {
        appendHtml(`<h4>Soluția Jocului (Punct Șa):</h4>`);
        appendHtml(`<p>Valoarea Jocului V = ${initialCheck.v1}.</p>`);
        appendHtml(`<p>Jocul are o soluție în strategii pure. Identificați strategiile corespunzătoare maximinului și minimaxului.</p>`);
    } else {
        rezolvaPLB_js(gameMatrix, initialCheck.v1, initialCheck.v2);
    }
}

// Initialize matrix inputs on page load
window.onload = setupMatrixInputs;