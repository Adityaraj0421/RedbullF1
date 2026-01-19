# LinkedIn Storytelling Post

---

**The Screen Became a Window**

Three weeks ago, I asked myself a question:

*"What if your screen wasn't a barrier—but a window into another world?"*

Not through VR. Not through AR. Just a browser, a webcam, and some creative engineering.

---

**The Problem I Wanted to Solve**

As someone who sits at the intersection of **design and development**, I've always been frustrated by the flatness of web experiences. We've gotten so good at making things *look* beautiful, but they still feel... distant. Trapped behind glass.

I wanted to break that fourth wall.

---

**The Experiment**

I decided to build something that would make people *lean in*—literally.

The concept: An F1 car sitting in a cinematic "shadow box" studio. But here's the twist—when you move your head, the perspective shifts in real-time, creating the illusion that you're looking through a physical window into a void.

**The Design Challenge:**

- Photorealistic lighting (Rembrandt-style key/fill setup)
- Reflective concrete floor with just the right amount of roughness
- Bloom effects on ceiling lights to create atmosphere
- A color palette so dark (#111111) it feels like staring into space

**The Technical Challenge:**

- Real-time face tracking using MediaPipe's Face Landmarker
- Off-axis projection math to create parallax based on head position
- Maintaining 60 FPS with React Three Fiber
- Sub-100ms latency so the interaction feels *instant*

---

**Where AI Came In**

Here's the part I want to be transparent about: **I used AI extensively throughout this project.**

Not as a replacement for thinking—but as a **thought partner and accelerator**.

AI helped me:

- Debug complex Three.js camera math at 2 AM
- Optimize shader performance when my reflections were tanking FPS
- Refactor component architecture when my state management got messy
- Generate texture loading patterns I hadn't considered

But here's what AI *couldn't* do:

- Decide that the floor should feel like "drying asphalt" instead of polished chrome
- Know that the camera sensitivity needed to be *inverted* to feel natural
- Understand that the lights needed to be *physically visible* to sell the illusion
- Feel when something was "off" and needed another iteration

**The design decisions, the aesthetic vision, the user experience—those came from me.**

AI was the tool. I was the craftsperson.

---

**What I Learned**

1. **Design and code are inseparable** in modern web experiences. You can't think about lighting without thinking about render performance.

2. **AI is a multiplier, not a replacement.** It made me 10x faster at execution, but only because I knew *what* to execute.

3. **The best interactions are invisible.** When people use this, they don't think about MediaPipe or off-axis projection—they just feel like they're looking through a window.

---

**The Result**

A web experience where moving your head left makes the camera pivot right. Where leaning in zooms you closer to the car. Where the screen stops being a screen.

It's not perfect. The face tracking occasionally loses you in low light. The reflections could be sharper. But it *works*—and more importantly, it makes people smile.

---

**Why I'm Sharing This**

Because I believe the future of product design isn't about choosing between "designer" or "developer."

It's about being both. About understanding aesthetics *and* algorithms. About using AI as a tool while keeping human creativity at the center.

If you're building at this intersection—or want to—let's connect. I'd love to hear what you're working on.

🔗 [Link to live demo]
💻 [Link to GitHub repo]

---

# ProductDesign #WebDevelopment #ThreeJS #AI #CreativeCoding #F1 #InteractiveDesign #ReactThreeFiber #ComputerVision

---

**P.S.** If you work at Red Bull Racing and think this is cool, I'd love to chat about how design and engineering can create magic together. 🏎️✨
