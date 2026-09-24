/**
 * Creative: brief → concepts → script → storyboard → draft video, reviewed in the team chat.
 * Verified against dewee: agent teams and delegation, knowledge vault, create_image,
 * create_video, tts, read_image, team task approval, usage caps, traces.
 */
import type { UseCase } from "./types";

export const creativeAdProduction: UseCase = {
  slug: "creative-ad-production",
  icon: "clapperboard",
  area: "make",
  team: { en: "Creative", vi: "Sáng tạo" },
  title: { en: "From brief to storyboard to ad cut", vi: "Thiết kế & dựng phim quảng cáo" },
  summary: {
    en: "Turn a brief into concepts, scripts, storyboards, images and draft videos, with review rounds right in the chat.",
    vi: "Biến brief thành ý tưởng, kịch bản, storyboard, hình ảnh và video nháp, duyệt vòng góp ý ngay trong nhóm chat.",
  },
  channels: ["slack", "discord", "telegram"],
  detail: {
    problem: {
      en: "Every campaign starts with a blank page and a deadline. By the time we have a storyboard to argue about, half the budget for revisions is already gone.",
      vi: "Chiến dịch nào cũng bắt đầu bằng một trang giấy trắng và một cái deadline. Tới lúc có storyboard để bàn thì ngân sách cho các vòng sửa đã đi mất một nửa.",
    },
    flow: {
      en: [
        "The creative director drops the brief in the team chat. The strategist agent replies with three concepts, each with a one-line reason.",
        "Once a concept is picked, the copywriter agent writes the script in your brand voice.",
        "The storyboard agent turns the script into frames, and the team comments on them right in the thread.",
        "After sign-off, the agents make a draft video and a voice-over for the edit.",
        "Feedback from every round is collected into one revision list, so nothing gets lost between versions.",
      ],
      vi: [
        "Giám đốc sáng tạo gửi brief vào nhóm chat. Agent chiến lược trả lời bằng ba ý tưởng, mỗi ý tưởng kèm một câu lý do.",
        "Chốt ý tưởng xong, agent copywriter viết kịch bản đúng giọng thương hiệu.",
        "Agent storyboard dựng kịch bản thành từng khung hình, cả đội góp ý ngay trong thread.",
        "Sau khi duyệt, các agent làm video nháp và giọng đọc để đưa vào dựng.",
        "Góp ý của mọi vòng được gom thành một danh sách chỉnh sửa, không thất lạc giữa các phiên bản.",
      ],
    },
    agents: {
      en: ["Strategist agent", "Copywriter agent", "Storyboard agent"],
      vi: ["Agent chiến lược", "Agent copywriter", "Agent storyboard"],
    },
    capabilities: {
      en: ["Agent teams & delegation", "Knowledge vault", "Image generation", "Video generation", "Text-to-speech", "Image reading for references"],
      vi: ["Đội agent & giao việc", "Kho tri thức", "Tạo hình ảnh", "Tạo video", "Chuyển văn bản thành giọng nói", "Đọc ảnh tham khảo"],
    },
    guardrails: {
      en: [
        "Nothing leaves the team chat. The creative director decides what moves forward.",
        "Each stage can be set to wait for approval before the next one starts.",
        "Usage caps keep image and video generation inside the budget you set.",
        "Every draft is traced, so you can see which prompt and which reference made it.",
        "Your brand assets and past campaigns stay in your own knowledge vault.",
      ],
      vi: [
        "Không có gì ra khỏi nhóm chat. Giám đốc sáng tạo quyết định bước nào được đi tiếp.",
        "Mỗi công đoạn có thể được cài để chờ duyệt rồi mới sang công đoạn sau.",
        "Giới hạn sử dụng giữ việc tạo ảnh, tạo video trong ngân sách bạn đặt ra.",
        "Bản nháp nào cũng có trace: được tạo từ prompt nào, dựa trên ảnh tham khảo nào.",
        "Tài sản thương hiệu và các chiến dịch cũ nằm trong kho tri thức của riêng bạn.",
      ],
    },
    chat: { channel: "slack", room: { en: "#tet-campaign", vi: "#chien-dich-tet" } },
    transcript: {
      en: [
        { who: "An", role: "Creative director", text: "@dewee brief is in the doc: a 30-second Tet spot for the milk tea brand. Give me three directions." },
        { who: "dewee", me: true, text: "1. “Home in a cup”: coming home for Tet. 2. “Grandma's recipe, remixed”: a grandmother and grandchild trade flavours. 3. “The red envelope challenge”: a playful twist on lucky money." },
        { who: "An", role: "Creative director", text: "Go with 2, but make it funnier." },
        { who: "dewee", me: true, text: "Script v2 and eight storyboard frames in about 20 minutes. I'll hold the video until you sign off on the frames ✓" },
        { who: "Quynh", role: "Producer", text: "Add a vertical cut for TikTok too, please." },
      ],
      vi: [
        { who: "Chị An", role: "Giám đốc sáng tạo", text: "@dewee brief chị để trong file: TVC Tết 30 giây cho nhãn trà sữa. Cho chị ba hướng nhé." },
        { who: "dewee", me: true, text: "1. “Tết trong một ly”: hành trình về nhà ăn Tết. 2. “Công thức của bà, phiên bản mới”: bà và cháu đổi vị cho nhau. 3. “Thử thách lì xì”: biến tấu vui nhộn chuyện mừng tuổi." },
        { who: "Chị An", role: "Giám đốc sáng tạo", text: "Chọn hướng 2, nhưng làm hài hơn chút nha." },
        { who: "dewee", me: true, text: "Khoảng 20 phút nữa em gửi kịch bản v2 và 8 khung storyboard ạ. Video em chờ chị duyệt khung hình rồi mới làm ✓" },
        { who: "Quỳnh", role: "Producer", text: "Thêm bản dọc cho TikTok nữa nhé em." },
      ],
    },
    outcome: {
      en: "Your team argues about real storyboards on day one instead of day five. More ideas get a fair look, revision rounds stay in one place, and people spend their craft on the choices that matter.",
      vi: "Ngay ngày đầu, cả đội đã có storyboard thật để bàn thay vì chờ tới ngày thứ năm. Nhiều ý tưởng hơn được xem xét công bằng, các vòng sửa nằm gọn một chỗ, và tay nghề của mọi người dành cho những lựa chọn quan trọng.",
    },
    description: {
      en: "dewee agents turn a brief into concepts, scripts, storyboards, images and draft videos, with every review round in your team chat and a person signing off.",
      vi: "Agent dewee biến brief thành ý tưởng, kịch bản, storyboard, hình ảnh và video nháp; góp ý ngay trong nhóm chat và luôn có người duyệt trước khi đi tiếp.",
    },
    related: ["retail-pod-design", "social-media-care", "ads-performance-watch"],
  },
};
