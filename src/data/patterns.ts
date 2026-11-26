import { SentencePattern } from '../types';

export const SENTENCE_PATTERNS: SentencePattern[] = [
  // A. Mẫu câu cho phần Action (What would you do?)
  {
    id: 'act-1',
    category: 'action',
    groupVi: 'Hẹn gặp riêng 1-1',
    labelVi: 'Hẹn gặp riêng 1-1 vào giờ trực hoặc sau giờ học',
    template: 'Schedule a private one-on-one meeting with [who] during [time].',
    slots: [
      { key: 'who', labelVi: 'Đối tượng', options: ['the student', 'those students', 'both students'] },
      { key: 'time', labelVi: 'Thời điểm', options: ['office hours or after class', 'break time', 'right after the test'] },
    ],
    usageNoteVi: 'Nêu rõ hành động, hình thức riêng tư (one-on-one) và thời điểm cụ thể để không làm học sinh xấu hổ trước lớp.',
  },
  {
    id: 'act-2',
    category: 'action',
    groupVi: 'Mở đầu tích cực',
    labelVi: 'Mở đầu bằng sự quan tâm và ghi nhận nỗ lực',
    template: 'Start the conversation positively by expressing your concern for [aspect] and acknowledging [effort].',
    slots: [
      { key: 'aspect', labelVi: 'Khía cạnh quan tâm', options: ['his/her learning', 'their classroom experience', 'his/her well-being'] },
      { key: 'effort', labelVi: 'Điều được ghi nhận', options: ['his/her effort', 'her thoughtful written work', 'how hard they worked'] },
    ],
    usageNoteVi: 'Dùng cấu trúc by + V-ing để làm rõ cách mở lời tích cực, tạo sự an toàn tâm lý.',
  },
  {
    id: 'act-3',
    category: 'action',
    groupVi: 'Đặt câu hỏi mở',
    labelVi: 'Lắng nghe bình tĩnh và đặt câu hỏi mở',
    template: 'Listen calmly without judging and ask open-ended questions to uncover [cause].',
    slots: [
      { key: 'cause', labelVi: 'Nguyên nhân cần tìm', options: ['the underlying cause', 'the real obstacles causing lateness', 'what made them feel unprepared'] },
    ],
    usageNoteVi: 'Tránh tra hỏi hoặc kết tội; tập trung tìm nguyên nhân gốc rễ (underlying cause).',
  },
  {
    id: 'act-4',
    category: 'action',
    groupVi: 'Nhắc nhở cả lớp',
    labelVi: 'Nhắc lại nội quy chung vào đầu tiết học tới',
    template: 'At the start of the next class, remind all students positively about classroom rules regarding [topic].',
    slots: [
      { key: 'topic', labelVi: 'Chủ đề nội quy', options: ['phone use and participation', 'academic honesty', 'punctuality and quiet entry', 'respectful teamwork'] },
    ],
    usageNoteVi: 'Dùng khi vấn đề ảnh hưởng đến cả lớp hoặc cần củng cố chuẩn mực chung.',
  },
  {
    id: 'act-5',
    category: 'action',
    groupVi: 'Điều chỉnh & hỗ trợ học tập',
    labelVi: 'Chia nhỏ hướng dẫn, làm mẫu và thống nhất kế hoạch',
    template: 'Break the instructions down with [support], adjust [routine], and agree on a realistic plan together.',
    slots: [
      { key: 'support', labelVi: 'Hỗ trợ trực quan', options: ['a clear worked example', 'one small manageable step', 'the grading rubric'] },
      { key: 'routine', labelVi: 'Nề nếp / cách dạy', options: ['the lesson routine', 'the homework routine', 'the seating arrangement'] },
    ],
    usageNoteVi: 'Phù hợp cho tình huống học sinh không hiểu bài, bài tập quá khó hoặc thiếu gắn kết.',
  },
  {
    id: 'act-6',
    category: 'action',
    groupVi: 'Hòa giải & xử lý xung đột',
    labelVi: 'Mời ra trao đổi riêng để hòa giải mâu thuẫn nhóm',
    template: 'Approach the group calmly, invite [who] to step aside for a brief private mediation, and help them agree on [agreement].',
    slots: [
      { key: 'who', labelVi: 'Học sinh liên quan', options: ['the two students', 'the group members'] },
      { key: 'agreement', labelVi: 'Thỏa thuận chung', options: ['clear, fair written roles', 'a shared task checklist', 'respectful communication rules'] },
    ],
    usageNoteVi: 'Ngăn leo thang căng thẳng và không làm gián đoạn các nhóm khác trong lớp.',
  },
  {
    id: 'act-7',
    category: 'action',
    groupVi: 'Đánh giá & điều chỉnh giảng dạy',
    labelVi: 'Thu thập phản hồi ẩn danh nhanh (exit ticket)',
    template: 'Collect quick anonymous feedback (such as [tool]) at the end of class to learn what students find [difficulty].',
    slots: [
      { key: 'tool', labelVi: 'Công cụ phản hồi', options: ['a two-minute exit ticket', 'a short anonymous poll'] },
      { key: 'difficulty', labelVi: 'Điểm vướng mắc', options: ['boring or difficult', 'unclear about the new strategy'] },
    ],
    usageNoteVi: 'Giúp học sinh dám góp ý thật về phương pháp dạy mới mà không ngại mất lòng.',
  },
  {
    id: 'act-8',
    category: 'action',
    groupVi: 'Minh bạch tiêu chí chấm điểm',
    labelVi: 'Đối chiếu bài làm cùng bảng tiêu chí (Rubric)',
    template: 'Walk through [artifact] alongside the grading rubric to show clearly [explanation] and how to improve next time.',
    slots: [
      { key: 'artifact', labelVi: 'Sản phẩm học tập', options: ['their assignment', 'the test questions'] },
      { key: 'explanation', labelVi: 'Nội dung làm rõ', options: ['where points were lost', 'what was expected'] },
    ],
    usageNoteVi: 'Chuyển cảm giác ấm ức về điểm số thành định hướng cải thiện cụ thể.',
  },

  // B. Mẫu câu cho phần Saying (What would you say? – Direct Speech)
  {
    id: 'say-1',
    category: 'saying',
    groupVi: 'Nêu quan sát nhẹ nhàng',
    labelVi: 'Mở lời bằng hiện tại hoàn thành không buộc tội',
    template: '"I\'ve noticed you seem [state] during class recently. Is everything okay?"',
    slots: [
      { key: 'state', labelVi: 'Trạng thái quan sát', options: ['distracted', 'stressed', 'quiet', 'a bit anxious'] },
    ],
    usageNoteVi: 'Luôn đặt trong ngoặc kép "..." và dùng "I\'ve noticed..." thay cho lời trách móc "Why do you always...".',
  },
  {
    id: 'say-2',
    category: 'saying',
    groupVi: 'Nêu quan sát nhẹ nhàng',
    labelVi: 'Ghi nhận nỗ lực và đồng cảm cảm xúc',
    template: '"I can see how hard you worked, and I understand why you feel [emotion]."',
    slots: [
      { key: 'emotion', labelVi: 'Cảm xúc của học sinh', options: ['disappointed', 'frustrated', 'worried about failing'] },
    ],
    usageNoteVi: 'Thể hiện sự thấu cảm (empathy) trước khi đi vào phân tích lỗi hay điểm số.',
  },
  {
    id: 'say-3',
    category: 'saying',
    groupVi: 'Đặt câu hỏi mở tìm nguyên nhân',
    labelVi: 'Hỏi điều khiến học sinh bận tâm hoặc mất tập trung',
    template: '"Is there something [bothering] or making it hard to [action]?"',
    slots: [
      { key: 'bothering', labelVi: 'Vấn đề', options: ['bothering you', 'going on outside class'] },
      { key: 'action', labelVi: 'Khó khăn gặp phải', options: ['focus', 'get to class on schedule', 'keep up with the lesson'] },
    ],
    usageNoteVi: 'Mở đường cho học sinh chia sẻ hoàn cảnh thật một cách an toàn.',
  },
  {
    id: 'say-4',
    category: 'saying',
    groupVi: 'Đặt câu hỏi mở tìm nguyên nhân',
    labelVi: 'Hỏi cảm nhận với find it + adj + to V',
    template: '"How do you feel during [activity]? Do you find it [adj] to [task]?"',
    slots: [
      { key: 'activity', labelVi: 'Hoạt động', options: ['class discussions', 'group projects', 'independent practice'] },
      { key: 'adj', labelVi: 'Tính từ', options: ['challenging', 'overwhelming', 'confusing'] },
      { key: 'task', labelVi: 'Động từ', options: ['participate', 'share ideas in front of the class', 'complete the steps on time'] },
    ],
    usageNoteVi: 'Lấy trực tiếp từ Slide 2; cấu trúc "Do you find it + adj + to V?" rất tự nhiên và giàu tính sư phạm.',
  },
  {
    id: 'say-5',
    category: 'saying',
    groupVi: 'Đặt câu hỏi mở tìm nguyên nhân',
    labelVi: 'Hỏi chính xác phần kiến thức/hướng dẫn gây rối',
    template: '"Which specific part of [target] felt most confusing to you?"',
    slots: [
      { key: 'target', labelVi: 'Phần bài học', options: ['the instructions or material', 'the assignment rubric', 'the first question'] },
    ],
    usageNoteVi: 'Giúp khoanh vùng chính xác chỗ hổng kiến thức thay vì hỏi chung chung "Do you understand?".',
  },
  {
    id: 'say-6',
    category: 'saying',
    groupVi: 'Nhắc nội quy & đề xuất (We / Let\'s)',
    labelVi: 'Nhắc nội quy điện thoại bằng giọng điệu tích cực',
    template: '"I want everyone to be involved in [activity], so let\'s all [rule] so we can focus on learning."',
    slots: [
      { key: 'activity', labelVi: 'Hoạt động lớp', options: ['our discussions', 'today\'s lesson', 'group work'] },
      { key: 'rule', labelVi: 'Hành động chung', options: ['put our phones away during class', 'listen respectfully when peers speak', 'stay focused on our tasks'] },
    ],
    usageNoteVi: 'Dùng "we / let\'s all" để xây dựng tinh thần tập thể thay vì ra lệnh cứng nhắc.',
  },
  {
    id: 'say-7',
    category: 'saying',
    groupVi: 'Nhắc nội quy & đề xuất (We / Let\'s)',
    labelVi: 'Đề xuất cùng xem lại tiêu chí / kế hoạch',
    template: '"Let\'s [step] together and agree on a clear plan so you feel [outcome] next time."',
    slots: [
      { key: 'step', labelVi: 'Bước hợp tác', options: ['look at the rubric', 'review the difficult topics', 'break today\'s activity into two parts'] },
      { key: 'outcome', labelVi: 'Kết quả mong muốn', options: ['more confident', 'better prepared', 'less stressed'] },
    ],
    usageNoteVi: 'Biến cuộc trao đổi thành sự đồng hành giữa giáo viên và học sinh.',
  },
  {
    id: 'say-8',
    category: 'saying',
    groupVi: 'Đối chiếu trung thực học thuật',
    labelVi: 'Nhắc nhở hành vi gian lận bình tĩnh nhưng dứt khoát',
    template: '"However, I noticed you [behavior], and [principle]. Let\'s make a study checklist—please always [alternative]."',
    slots: [
      { key: 'behavior', labelVi: 'Hành vi quan sát', options: ['looking at your classmate\'s paper', 'copying answers during the quiz'] },
      { key: 'principle', labelVi: 'Nguyên tắc', options: ['cheating doesn\'t reflect what you truly know', 'academic honesty protects your real progress'] },
      { key: 'alternative', labelVi: 'Giải pháp thay thế', options: ['ask me for help before a test instead of cheating', 'message me early if you feel unprepared'] },
    ],
    usageNoteVi: 'Kết hợp cân bằng giữa sự thấu cảm và chuẩn mực trung thực học thuật.',
  },

  // C. Mẫu câu cho phần Goal (Why would you do it?)
  {
    id: 'goal-1',
    category: 'goal',
    groupVi: 'Hiểu nguyên nhân & thể hiện sự quan tâm',
    labelVi: 'Tìm hiểu nguyên nhân gốc rễ và thể hiện sự quan tâm',
    template: 'Understand the underlying reasons for [issue] and show that you care about [focus].',
    slots: [
      { key: 'issue', labelVi: 'Vấn đề', options: ['his/her distraction', 'their repeated lateness', 'the student\'s test anxiety'] },
      { key: 'focus', labelVi: 'Mối quan tâm', options: ['his/her experience in the classroom', 'his/her learning progress', 'their academic growth'] },
    ],
    usageNoteVi: 'Mẫu câu chuẩn mực từ Slide 2; luôn đi kèm đại từ trung lập his/her hoặc their.',
  },
  {
    id: 'goal-2',
    category: 'goal',
    groupVi: 'Xây dựng niềm tin & giảm áp lực',
    labelVi: 'Xây dựng niềm tin, giảm lo âu và khuyến khích nhờ hỗ trợ',
    template: 'Build trust, reduce [barrier], and help the student feel safe [action] in the future.',
    slots: [
      { key: 'barrier', labelVi: 'Rào cản tâm lý', options: ['speaking anxiety', 'frustration and helplessness', 'fear of failing'] },
      { key: 'action', labelVi: 'Hành động tích cực', options: ['asking for support', 'participating gradually', 'sharing honest feedback'] },
    ],
    usageNoteVi: 'Nhấn mạnh tác động tâm lý lâu dài đối với người học.',
  },
  {
    id: 'goal-3',
    category: 'goal',
    groupVi: 'Củng cố nội quy & môi trường lớp học',
    labelVi: 'Duy trì môi trường học tập tôn trọng và tập trung',
    template: 'Ensure that all students understand the importance of [value]. This helps to maintain a [adj] environment where everyone can learn effectively.',
    slots: [
      { key: 'value', labelVi: 'Giá trị / Nội quy', options: ['following classroom rules', 'respecting class time', 'upholding academic integrity'] },
      { key: 'adj', labelVi: 'Tính chất môi trường', options: ['respectful and focused', 'supportive and calm', 'collaborative and safe'] },
    ],
    usageNoteVi: 'Mẫu câu kinh điển từ Slide 3 cho các tình huống ảnh hưởng tới trật tự chung.',
  },
  {
    id: 'goal-4',
    category: 'goal',
    groupVi: 'Phát triển kỹ năng cho học sinh',
    labelVi: 'Khuyến khích tính tự chủ và thói quen học tập hiệu quả',
    template: 'Encourage [habit] and guide the student toward [skill] for future assessments.',
    slots: [
      { key: 'habit', labelVi: 'Phẩm chất / Thói quen', options: ['personal responsibility and early help-seeking', 'accountability and punctuality habits', 'a growth mindset'] },
      { key: 'skill', labelVi: 'Kỹ năng hướng tới', options: ['honest, effective study habits', 'confident classroom participation', 'constructive teamwork skills'] },
    ],
    usageNoteVi: 'Gắn kết xử lý tình huống tức thời với năng lực tự học lâu dài.',
  },
  {
    id: 'goal-5',
    category: 'goal',
    groupVi: 'Minh bạch & điều chỉnh sư phạm',
    labelVi: 'Làm rõ kỳ vọng và khôi phục hứng thú học tập',
    template: 'Clarify [target] immediately and adapt instruction to [outcome].',
    slots: [
      { key: 'target', labelVi: 'Đối tượng làm rõ', options: ['misunderstandings and task expectations', 'grading criteria'] },
      { key: 'outcome', labelVi: 'Kết quả lớp học', options: ['restore curiosity and active participation', 'keep everyone on track', 'increase task completion rates'] },
    ],
    usageNoteVi: 'Dùng cho các bài viết về bất đồng điểm số, bài tập khó hoặc đổi mới phương pháp dạy.',
  },
];
