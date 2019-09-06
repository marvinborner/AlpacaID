const emails = [
    "contact@marvinborner.de",
    "test@apfel.de",
    ""
];

emails.forEach(email => {
    if (email.length > 32) {
        console.error("Email is too long!", email);
        return
    }

    const pixel = 40;
    const border = 3;
    const canvas = document.createElement("canvas");
    canvas.id = email;
    canvas.width = 13.5 * pixel - 2 * border;
    canvas.height = 13.5 * pixel - 2 * border;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Draw border
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, border, canvas.height);
    ctx.fillRect(0, canvas.height - border, canvas.width, border);
    ctx.fillRect(0, 0, canvas.width, border);
    ctx.fillRect(canvas.width - border, 0, border, canvas.height);
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(email + " ~ by Marvin Borner", canvas.width / 2, canvas.height - (11 + border));

    // Random characters
    function random(length) {
        let result = "";
        const characters = "abcdefghijklmnopqrstuvwxyz";
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
        return result;
    }

    // Parse email
    const arr = [];
    email += String.fromCharCode(0);
    email += random(35);
    email.toLowerCase().split("").forEach(char => {
        const binary = char.charCodeAt(0).toString(2);
        arr.push("00000000".substr(binary.length) + binary); // Pad
    });

    // DRAW!
    const draw = (x, y, nibble) => {
        console.log(nibble);
        nibble.forEach((bit, index) => {
            ctx.fillStyle = bit === "1" ? "#000000" : "#2aabe1";
            const x_pos = [1, 3].includes(index) ? x + 1 : x;
            const y_pos = [2, 3].includes(index) ? y + 1 : y;
            ctx.fillRect((x_pos * (pixel / 2)) + border, (y_pos * (pixel / 2)) + border, pixel / 2, pixel / 2);
        });
    };

    arr.forEach((value, index) => {
        console.log(value);
        const first = value.substr(0, 4).split("");
        const second = value.substr(4).split("");
        switch (index) {
            case 0:
                draw(2, 4, first);
                draw(2, 6, second);
                break;
            case 1:
                draw(2, 8, first);
                draw(2, 10, second);
                break;
            case 2:
                draw(2, 12, first);
                draw(2, 14, second);
                break;
            case 3:
                draw(2, 16, first);
                draw(2, 18, second);
                break;

            case 4:
                draw(4, 2, first);
                draw(4, 4, second);
                break;
            case 5:
                draw(4, 6, first);
                draw(4, 8, second);
                break;
            case 6:
                draw(4, 10, first);
                draw(20, 10, second);
                break;
            case 7:
                draw(4, 18, first);
                draw(4, 20, second);
                break;

            case 8:
                draw(6, 2, first);
                draw(6, 4, second);
                break;
            case 9:
                draw(6, 6, first);
                draw(6, 8, second);
                break;
            case 10:
                draw(6, 20, first);
                draw(6, 22, second);
                break;

            case 11:
                draw(8, 4, first);
                draw(8, 6, second);
                break;
            case 12:
                draw(8, 8, first);
                draw(8, 22, second);
                break;

            case 13:
                draw(10, 6, first);
                draw(10, 8, second);
                break;

            case 14:
                draw(12, 6, first);
                draw(12, 8, second);
                break;

            case 15:
                draw(14, 6, first);
                draw(14, 8, second);
                break;

            case 16:
                draw(16, 4, first);
                draw(16, 6, second);
                break;
            case 17:
                draw(16, 8, first);
                draw(16, 22, second);
                break;

            case 18:
                draw(18, 2, first);
                draw(18, 4, second);
                break;
            case 19:
                draw(18, 6, first);
                draw(18, 8, second);
                break;
            case 20:
                draw(18, 20, first);
                draw(18, 22, second);
                break;

            case 21:
                draw(20, 2, first);
                draw(20, 4, second);
                break;
            case 22:
                draw(20, 6, first);
                draw(20, 8, second);
                break;
            case 23:
                draw(20, 18, first);
                draw(20, 20, second);
                break;

            case 24:
                draw(22, 4, first);
                draw(22, 6, second);
                break;
            case 25:
                draw(22, 8, first);
                draw(22, 10, second);
                break;
            case 26:
                draw(22, 12, first);
                draw(22, 14, second);
                break;
            case 27:
                draw(22, 16, first);
                draw(22, 18, second);
                break;

            case 28:
                draw(6, 14, first);
                draw(18, 14, second);
                break;

            case 29:
                draw(10, 16, first);
                draw(10, 18, second);
                break;
            case 30:
                draw(14, 16, first);
                draw(14, 18, second);
                break;
            case 31:
                draw(12, 18, first);
                draw(12, 22, second);
                break;

            case 32:
                draw(10, 22, first);
                draw(14, 22, second);
                break;
        }
    });
});
