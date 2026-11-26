import { SituationItem } from '../types';

export const FRAMEWORK_REFERENCE = {
  rules: [
    {
      title: '1 vấn đề (+ nguyên nhân tâm lý)',
      description: 'Gộp toàn bộ phương án xử lý vào 1 khung trả lời duy nhất gồm Action – Saying – Goal (không tách thành 2 bước).',
      badge: '1 Khung',
    },
    {
      title: '2 vấn đề riêng biệt',
      description: 'Giải quyết cả 2 vấn đề, trong đó mỗi vấn đề trình bày thành 1 khung Action – Saying – Goal riêng (tổng cộng 2 khung).',
      badge: '2 Khung',
    },
    {
      title: 'Giọng điệu sư phạm (Tone)',
      description: 'Luôn giữ thái độ bình tĩnh (calm), tôn trọng (respectful), không phán xét (non-judgmental) và hướng tới giải pháp (solution-focused).',
      badge: 'Tone chuẩn',
    },
  ],
  table: [
    {
      part: 'Action',
      question: 'What would you do?',
      remember: 'Give clear actions.',
      guideVi: 'Nêu hành động cụ thể, rõ thời điểm (after class, at the start of the next class) và đối tượng (one-on-one with the student, the whole class).',
    },
    {
      part: 'Saying',
      question: 'What would you say?',
      remember: 'Use direct speech.',
      guideVi: 'Viết nguyên văn lời giáo viên nói trực tiếp với học sinh trong dấu ngoặc kép (dùng ngôi I / you / we, câu hỏi mở, giọng điệu tôn trọng và khích lệ).',
    },
    {
      part: 'Goal',
      question: 'Why would you do it?',
      remember: 'Explain your purpose.',
      guideVi: 'Giải thích mục đích sư phạm: hiểu nguyên nhân, xây dựng niềm tin, duy trì môi trường học tập tôn trọng và hiệu quả.',
    },
  ],
};

export const SITUATION_ITEMS: SituationItem[] = [
  {
    id: 'slide-sit-1',
    code: 'Slide 1–3',
    titleVi: 'Học sinh mất tập trung, xem điện thoại và nói chuyện riêng',
    sourceLabel: 'Slide Bài giảng',
    topic: 'Disruption',
    problemCount: 2,
    problemNoteVi: '2 vấn đề riêng biệt: (1) Học sinh mất tập trung (cần gặp 1-1 tìm nguyên nhân gốc rễ) & (2) Xem điện thoại, nói chuyện riêng ảnh hưởng lớp (nhắc nội quy cả lớp).',
    promptEn:
      'While teaching a lesson, you notice that one student frequently gets distracted. They often look at their phone or talk to friends instead of participating in the discussion. This behavior makes it difficult for them to learn and can also disturb the other students. What should you do?',
    promptVi:
      'Trong khi đang giảng bài, bạn nhận thấy một học sinh thường xuyên bị mất tập trung. Học sinh đó hay nhìn vào điện thoại hoặc nói chuyện với bạn bè thay vì tham gia thảo luận. Hành vi này khiến em ấy khó tiếp thu bài học và cũng có thể làm phiền các học sinh khác. Bạn nên làm gì?',
    frames: [
      {
        labelVi: 'Vấn đề 1: Học sinh mất tập trung (Engagement with the Student)',
        action:
          'Schedule a one-on-one meeting with the student during office hours or after class. Start the conversation positively by expressing your concern for his/her learning and ask open-ended questions.',
        saying:
          '"I\'ve noticed you seem distracted during class. Is there something bothering you? How do you feel during class discussions? Do you find it challenging to participate?"',
        goal: 'Understand the underlying reasons for his/her distraction and show that you care about his/her experience in the classroom.',
        structureNoteVi: 'Hẹn gặp riêng tư 1-1 sau giờ học, mở lời tích cực và đặt câu hỏi mở để tìm nguyên nhân gốc rễ (underlying reasons).',
      },
      {
        labelVi: 'Vấn đề 2: Xem điện thoại và nói chuyện riêng ảnh hưởng lớp',
        action:
          'At the start of the next class, remind all students about the rules for phone use and participation.',
        saying:
          '"I want everyone to be involved in our discussions, so let\'s all put our phones away during class so we can focus on learning."',
        goal: 'Ensure that all students understand the importance of following classroom rules. This helps to maintain a respectful and focused environment where everyone can learn effectively.',
        structureNoteVi: 'Nhắc lại nội quy chung cho cả lớp một cách tích cực với đại từ "we / let\'s".',
      },
    ],
    suggestedVocabIds: ['distracted', 'disturb', 'participate', 'underlying', 'schedule', 'one-on-one', 'express-concern', 'open-ended', 'maintain', 'respectful'],
    suggestedPatternIds: ['act-1', 'act-2', 'act-4', 'say-1', 'say-4', 'say-6', 'goal-1', 'goal-3'],
  },
  {
    id: 'slide-sit-2',
    code: 'Slide 5 (HW)',
    titleVi: 'Học sinh gian lận trong bài kiểm tra vì sợ trượt dù đã học chăm',
    sourceLabel: 'Bài tập về nhà',
    topic: 'Cheating',
    problemCount: 1,
    problemNoteVi: '1 vấn đề kèm nguyên nhân tâm lý: Học sinh gian lận do học chăm nhưng vẫn cảm thấy chưa sẵn sàng và quá sợ trượt -> gộp vào 1 khung duy nhất.',
    promptEn:
      'During a test, you see a student looking at the paper of the person next to him/her several times. After the test, you find out that this student studied hard but still felt unprepared. Because he/she was worried about failing, he/she decided to cheat out of desperation.',
    promptVi:
      'Trong một bài kiểm tra, bạn nhìn thấy một học sinh liếc nhìn bài của người ngồi bên cạnh nhiều lần. Sau bài kiểm tra, bạn biết được rằng học sinh này đã học rất chăm chỉ nhưng vẫn cảm thấy chưa đủ tự tin/chưa chuẩn bị kỹ. Vì quá lo lắng sẽ bị trượt, em ấy đã quyết định gian lận trong lúc tuyệt vọng.',
    frames: [
      {
        labelVi: 'Khung giải quyết thống nhất (1 vấn đề + nguyên nhân tâm lý)',
        action:
          'Schedule a private one-on-one meeting with the student after the test, start empathetically by acknowledging his/her hard work, clearly address the cheating behavior according to school policy, ask what made him/her feel unprepared, and build a simple review plan together for future exams.',
        saying:
          '"I know you studied very hard for this test, and I appreciate your effort. However, I noticed you looking at your classmate\'s paper, and cheating doesn\'t reflect what you truly know. What made you feel unprepared? Let\'s review the difficult topics together and make a study checklist so you feel confident next time—please always ask me for help before a test instead of cheating."',
        goal: 'Uphold academic integrity while showing empathy and care, understand the root causes of the student\'s test anxiety, and guide him/her toward honest, effective study habits for future assessments.',
      },
    ],
    suggestedVocabIds: ['cheat', 'desperation', 'unprepared', 'academic-integrity', 'schedule', 'one-on-one', 'encourage'],
    suggestedPatternIds: ['act-1', 'act-2', 'say-2', 'say-7', 'say-8', 'goal-2', 'goal-4'],
  },
  {
    id: 'ext-1',
    code: 'Ví dụ 1',
    titleVi: 'Học sinh nhút nhát, lo âu khi phát biểu trước lớp dù bài viết tốt',
    sourceLabel: 'Ví dụ mở rộng',
    topic: 'Disengagement',
    problemCount: 1,
    problemNoteVi: '1 vấn đề + nguyên nhân tâm lý: Ít nói trong thảo luận vì lo âu khi nói trước đám đông.',
    promptEn:
      'During group discussions, one quiet student rarely speaks and avoids eye contact. Although their written work is good, they seem anxious whenever asked to share ideas in front of the class. What should you do?',
    promptVi:
      'Trong các buổi thảo luận nhóm, một học sinh trầm tính hiếm khi phát biểu và thường tránh giao tiếp bằng mắt. Dù bài viết của em rất tốt, em tỏ ra lo âu mỗi khi được mời chia sẻ ý kiến trước lớp. Bạn nên làm gì?',
    frames: [
      {
        action:
          'Talk privately with the student after class to praise his/her thoughtful written work, ask gently about his/her anxiety when speaking, and introduce low-pressure pair-share activities (Think–Pair–Share) in upcoming lessons so he/she can practice sharing with one partner before speaking to the whole class.',
        saying:
          '"Your written ideas are always clear and thoughtful. I\'ve noticed you seem a bit anxious during class discussions—how would you feel about sharing your ideas with one partner first before we discuss as a whole class?"',
        goal: 'Build the student\'s self-confidence by recognizing his/her strengths, reduce speaking anxiety, and create a supportive environment where quiet learners can gradually participate comfortably.',
      },
    ],
    suggestedVocabIds: ['participate', 'one-on-one', 'encourage', 'supportive', 'respectful'],
    suggestedPatternIds: ['act-1', 'act-2', 'say-1', 'say-4', 'goal-2'],
  },
  {
    id: 'ext-2',
    code: 'Ví dụ 2',
    titleVi: 'Hai học sinh tranh cãi gay gắt, không hợp tác khi làm việc nhóm',
    sourceLabel: 'Ví dụ mở rộng',
    topic: 'Group Conflict',
    problemCount: 1,
    problemNoteVi: '1 vấn đề: Xung đột phân chia công việc giữa hai học sinh trong dự án nhóm.',
    promptEn:
      'During a group project, two students start arguing loudly about how to divide the work and refuse to cooperate with each other, slowing down the whole group. What should you do?',
    promptVi:
      'Trong một dự án nhóm, hai học sinh bắt đầu tranh cãi to tiếng về cách chia việc và từ chối hợp tác với nhau, làm chậm tiến độ của cả nhóm. Bạn nên làm gì?',
    frames: [
      {
        action:
          'Approach the group calmly, invite the two students to step aside for a brief private mediation so each can explain his/her view without interruption, and help them agree on clear, fair written roles for the project.',
        saying:
          '"Let\'s pause for a moment and talk calmly over here. I\'d like to hear both of your perspectives—what part of the workload feels unfair, and how can we divide the tasks clearly so your team can move forward?"',
        goal: 'De-escalate the conflict quickly without disrupting other groups, ensure both students feel heard, and strengthen their collaboration and respectful communication skills.',
      },
    ],
    suggestedVocabIds: ['conflict', 'collaborate', 'disruptive', 'respectful', 'clarify'],
    suggestedPatternIds: ['act-6', 'say-6', 'goal-3', 'goal-4'],
  },
  {
    id: 'ext-3',
    code: 'Ví dụ 3',
    titleVi: 'Học sinh học yếu gục đầu chán nản, muốn bỏ cuộc vì bài khó',
    sourceLabel: 'Ví dụ mở rộng',
    topic: 'Disengagement',
    problemCount: 1,
    problemNoteVi: '1 vấn đề + nguyên nhân tâm lý: Muốn bỏ cuộc vì cảm thấy bài tập vượt quá sức.',
    promptEn:
      'While working on a challenging exercise, a struggling student puts their head down, stops trying, and says they will never understand the subject. What should you do?',
    promptVi:
      'Khi đang làm một bài tập khó, một học sinh học yếu gục đầu xuống bàn, ngừng cố gắng và nói rằng em ấy sẽ không bao giờ hiểu được môn học này. Bạn nên làm gì?',
    frames: [
      {
        action:
          'Walk over quietly during independent work (or check in right after class), validate the student\'s frustration without criticizing, break the assignment into one small manageable first step, and offer a brief guided review or supportive study partner.',
        saying:
          '"I can see this exercise feels frustrating right now, and it\'s completely normal to struggle with new material. Let\'s look at just the first question together—which part feels most confusing? Step by step, you can get this."',
        goal: 'Ease the student\'s frustration and helplessness, show genuine care, and help him/her achieve a small win to rebuild motivation and a growth mindset.',
      },
    ],
    suggestedVocabIds: ['disengaged', 'supportive', 'encourage', 'clarify', 'underlying'],
    suggestedPatternIds: ['act-5', 'say-2', 'say-5', 'say-7', 'goal-2', 'goal-4'],
  },
  {
    id: 'prac-1',
    code: 'Practice 1',
    titleVi: 'Một vài học sinh liên tục nói chuyện, ngắt lời dù đã được nhắc nhở',
    sourceLabel: 'Thực hành bổ sung',
    topic: 'Disruption',
    problemCount: 1,
    problemNoteVi: '1 vấn đề: Nhóm học sinh liên tục nói chuyện, gây gián đoạn bài giảng dù đã nhắc.',
    promptEn:
      'You notice that a few students are consistently interrupting the class and talking while you are teaching. This behavior disrupts the lesson and makes it hard for other students to concentrate. Despite reminding them to stay quiet, they continue to disrupt the class. What should you do to address the situation?',
    promptVi:
      'Bạn nhận thấy một vài học sinh liên tục ngắt lời và nói chuyện trong lúc bạn đang giảng bài. Hành vi này làm gián đoạn tiết học và khiến các bạn khác khó tập trung. Dù bạn đã nhắc giữ trật tự, các em vẫn tiếp tục gây rối. Bạn nên làm gì để giải quyết tình huống này?',
    frames: [
      {
        action:
          'Pause briefly to regain attention, avoid arguing in front of the class, and hold a calm private meeting with those students right after class to address their repeated interruptions, understand why they keep talking, and agree on clear seating or behavior expectations for the next lesson.',
        saying:
          '"I\'ve noticed you\'ve been talking during the lesson even after my reminders, which makes it hard for your classmates to concentrate. Is there something making it difficult to focus? Let\'s agree on a plan—such as sitting in different seats—so everyone can learn respectfully."',
        goal: 'Stop the ongoing disruption without escalating tension in class, identify any underlying reasons for the behavior, and reinforce respectful classroom norms so all students can concentrate effectively.',
      },
    ],
    suggestedVocabIds: ['disruptive', 'disturb', 'underlying', 'reinforce', 'respectful', 'maintain'],
    suggestedPatternIds: ['act-1', 'act-3', 'say-1', 'say-3', 'goal-3'],
  },
  {
    id: 'prac-2',
    code: 'Practice 2',
    titleVi: 'Không hiểu hướng dẫn/bài học & Lặp lại việc không làm bài tập về nhà',
    sourceLabel: 'Thực hành bổ sung',
    topic: 'Homework',
    problemCount: 2,
    problemNoteVi: '2 vấn đề riêng biệt: (1) Nhiều học sinh không hiểu hướng dẫn/kiến thức bài học & (2) Tình trạng thiếu bài tập về nhà lặp lại lần thứ hai trong học kỳ.',
    promptEn:
      'You have assigned a homework task, but a significant number of students did not complete it. When asked, many of them claim they did not understand the instructions or the material. This is the second time this has happened this semester. What should you do to address the situation?',
    promptVi:
      'Bạn đã giao một nhiệm vụ bài tập về nhà nhưng một số lượng đáng kể học sinh không hoàn thành. Khi được hỏi, nhiều em cho rằng mình không hiểu hướng dẫn hoặc kiến thức bài học. Đây là lần thứ hai điều này xảy ra trong học kỳ này. Bạn nên làm gì?',
    frames: [
      {
        labelVi: 'Vấn đề 1: Nhiều học sinh không hiểu hướng dẫn hoặc kiến thức bài học',
        action:
          'Pause new content briefly in class to review the confusing concepts step by step, break the instructions down with a clear worked example on the board, and ask quick check-for-understanding questions before moving on.',
        saying:
          '"I hear that many of you found the instructions and material unclear, so let\'s go through one example together step by step. Which specific part felt most confusing to you?"',
        goal: 'Clarify misunderstandings immediately, ensure students grasp the core material and task expectations, and build a supportive environment where they feel comfortable asking for clarification.',
      },
      {
        labelVi: 'Vấn đề 2: Tình trạng không hoàn thành BTVN lặp lại lần thứ hai trong học kỳ',
        action:
          'Set a fair, short extension for this assignment while establishing a consistent homework routine—such as posting written instructions with examples and reserving the last five minutes of every lesson for students to start the task and ask questions before going home.',
        saying:
          '"Since this is the second time many homework tasks weren\'t completed, let\'s adjust our routine. From now on, we\'ll review the instructions together and start the first question in class—please message or ask me early if you get stuck instead of leaving the work undone."',
        goal: 'Prevent recurring incomplete homework, encourage student responsibility and early help-seeking, and create a reliable support system so everyone can finish assignments on time.',
      },
    ],
    suggestedVocabIds: ['unprepared', 'clarify', 'supportive', 'encourage', 'reinforce'],
    suggestedPatternIds: ['act-5', 'say-5', 'say-7', 'goal-4', 'goal-5'],
  },
  {
    id: 'prac-3',
    code: 'Practice 3',
    titleVi: 'Học sinh thường xuyên đi học muộn dù đã trao đổi, gây gián đoạn lớp',
    sourceLabel: 'Thực hành bổ sung',
    topic: 'Tardiness',
    problemCount: 1,
    problemNoteVi: '1 vấn đề: Học sinh lặp lại việc đi muộn và gây xáo trộn cho các bạn cùng lớp.',
    promptEn:
      'You have a student who often arrives late to class. Despite your discussions with them about the importance of being on time, they continue to disrupt the class by entering late, causing distractions for their peers. What should you do to address the situation?',
    promptVi:
      'Bạn có một học sinh thường xuyên đi học muộn. Mặc dù bạn đã trao đổi với em ấy về tầm quan trọng của việc đúng giờ, em vẫn tiếp tục làm gián đoạn lớp học khi vào muộn, gây xao nhãng cho các bạn khác. Bạn nên làm gì?',
    frames: [
      {
        action:
          'Schedule a focused one-on-one meeting with the student after class to uncover the real obstacles causing their repeated lateness, set a quiet late-entry routine (entering through the back seat without interrupting), and agree on a realistic punctuality goal together.',
        saying:
          '"We\'ve talked about arriving on time before, so I want to check in—what is making it hard for you to get to class on schedule? While we work on fixing that, if you are ever late, please enter quietly and catch up after class so we don\'t distract your peers."',
        goal: 'Address the root cause of chronic tardiness constructively, minimize classroom disruptions for other students, and help the student build accountability and punctuality habits.',
      },
    ],
    suggestedVocabIds: ['punctual', 'disturb', 'disruptive', 'underlying', 'schedule', 'one-on-one'],
    suggestedPatternIds: ['act-1', 'act-3', 'say-3', 'goal-1', 'goal-4'],
  },
  {
    id: 'prac-4',
    code: 'Practice 4',
    titleVi: 'Học sinh buồn bã về điểm số vì không hiểu rõ tiêu chí chấm điểm',
    sourceLabel: 'Thực hành bổ sung',
    topic: 'Grade Dispute',
    problemCount: 1,
    problemNoteVi: '1 vấn đề + nguyên nhân tâm lý: Bất mãn về điểm số do không hiểu kỳ vọng/tiêu chí bài tập.',
    promptEn:
      'After giving feedback on an assignment, a student approaches you, upset because they feel their grade does not reflect their effort. They express that they worked hard but didn\'t understand the expectations. What should you do to address the situation?',
    promptVi:
      'Sau khi bạn trả nhận xét cho một bài tập, một học sinh đến gặp bạn trong tâm trạng buồn bã vì cảm thấy điểm số không phản ánh đúng nỗ lực của mình. Em chia sẻ rằng mình đã làm việc rất chăm chỉ nhưng không hiểu rõ các yêu cầu/kỳ vọng của bài. Bạn nên làm gì?',
    frames: [
      {
        action:
          'Meet privately with the student after class, listen calmly to validate their effort and frustration, walk through their assignment alongside the grading rubric to show exactly where points were lost, and explain how they can apply this feedback to improve next time.',
        saying:
          '"I can see how hard you worked, and I understand why you feel disappointed with this grade. Let\'s look at the rubric together so I can show you what was expected and how we can use this feedback to help you score higher on the next assignment."',
        goal: 'Acknowledge the student\'s effort to ease frustration, make grading expectations transparent, and turn a disappointing grade into a clear, motivating learning opportunity.',
      },
    ],
    suggestedVocabIds: ['rubric', 'clarify', 'supportive', 'encourage', 'one-on-one'],
    suggestedPatternIds: ['act-2', 'act-8', 'say-2', 'say-7', 'goal-5'],
  },
  {
    id: 'prac-5',
    code: 'Practice 5',
    titleVi: 'Học sinh chán nản với phương pháp dạy mới & Không xong hoạt động trên lớp',
    sourceLabel: 'Thực hành bổ sung',
    topic: 'Disengagement',
    problemCount: 2,
    problemNoteVi: '2 vấn đề riêng biệt: (1) Học sinh nhàm chán, thiếu gắn kết với phương pháp mới & (2) Thường xuyên không hoàn thành hoạt động trên lớp.',
    promptEn:
      'You have been implementing a new teaching strategy, but you notice that many students seem disengaged and are not participating as actively as before. They appear bored during lessons and often do not complete in-class activities. What should you do to address the situation?',
    promptVi:
      'Bạn đang áp dụng một phương pháp giảng dạy mới, nhưng nhận thấy nhiều học sinh có vẻ thiếu gắn kết và không tham gia tích cực như trước. Các em trông có vẻ chán nản trong giờ học và thường không hoàn thành các hoạt động trên lớp. Bạn nên làm gì?',
    frames: [
      {
        labelVi: 'Vấn đề 1: Học sinh cảm thấy nhàm chán, thiếu gắn kết với phương pháp mới',
        action:
          'Collect quick anonymous feedback (such as a two-minute exit ticket) at the end of class to learn what students find boring or difficult about the new strategy, then adjust the lessons by blending interactive elements, relatable examples, and student choice.',
        saying:
          '"I\'ve noticed the new teaching method hasn\'t felt as engaging lately, and your learning experience matters to me. Please write down one thing that isn\'t working and one activity you enjoy so I can adjust our lessons to be more interactive."',
        goal: 'Understand students\' reactions to the new teaching approach, show that their feedback is valued, and adapt instruction to restore curiosity and active participation.',
      },
      {
        labelVi: 'Vấn đề 2: Học sinh thường xuyên không hoàn thành các hoạt động trên lớp',
        action:
          'Break in-class activities into shorter, timed chunks with clear milestones, pair students for quick peer check-ins, and circulate around the room to offer immediate guidance and keep everyone on track.',
        saying:
          '"Let\'s break today\'s activity into two short ten-minute parts and work with a partner—raise your hand anytime you get stuck so we can finish each step together before the bell."',
        goal: 'Make in-class tasks feel manageable rather than overwhelming, maintain steady momentum, and increase completion rates across the class.',
      },
    ],
    suggestedVocabIds: ['disengaged', 'participate', 'supportive', 'collaborate', 'encourage'],
    suggestedPatternIds: ['act-5', 'act-7', 'say-1', 'say-7', 'goal-5'],
  },
];
