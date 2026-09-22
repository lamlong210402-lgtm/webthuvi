let count = 0;


// Danh sách lời tiên đoán
const messages = [

    "✨ Hôm nay có vẻ là một ngày khá may mắn với bạn.",

    "💫 Một cơ hội bất ngờ có thể xuất hiện. Nhớ để ý nhé.",

    "❤️ Có người đang nghĩ đến bạn đấy.",

    "🔥 Đây là thời điểm khá tốt để thử một điều mới.",

    "🍀 Một chuyện nhỏ có thể khiến bạn vui cả ngày.",

    "💰 Ví tiền chưa chắc tăng, nhưng vận may thì có vẻ đang tăng.",

    "😎 Hôm nay bạn có một nguồn năng lượng rất khác thường.",

    "🌙 Điều bạn đang chờ đợi có thể sớm có câu trả lời.",

    "🎯 Nếu đang phân vân, hãy mạnh dạn thêm một chút.",

    "🧠 Một ý tưởng bất chợt hôm nay có thể hữu ích về sau."

];


// Hàm khi bấm nút
function discoverLuck() {

    // Tạo số ngẫu nhiên từ 1 đến 100
    let luck = Math.floor(Math.random() * 100) + 1;


    // Chọn một câu ngẫu nhiên
    let randomIndex =
        Math.floor(Math.random() * messages.length);


    let message =
        messages[randomIndex];


    // Hiển thị điểm may mắn
    document.getElementById("luckNumber").textContent = luck;


    // Hiển thị lời tiên đoán
    document.getElementById("message").textContent = message;


    // Tăng số lần khám phá
    count++;


    // Hiển thị số lần khám phá
    document.getElementById("counter").textContent =
        "Bạn đã khám phá " + count + " lần.";
}