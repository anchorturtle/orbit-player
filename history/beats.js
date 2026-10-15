// v5 pacing: one idea per screen beat. [big line, supporting line]. Long-form text lives in "Dig deeper".
window.BEATS={
origins:{hook:"What's the simplest possible computer?",beats:[
 ["A row of beads.","Slide one over and the number changes. The abacus stores a number as a position, and it's been doing that for thousands of years."],
 ["1642: gears that carry the one.","A 19-year-old Blaise Pascal builds an adding machine to help his tax-collector dad."],
 ["Leibniz bets on two digits.","Everything can be written with just 0 and 1. He thought it was beautiful; we now call it binary."],
 ["Then a loom learns to read.","Jacquard's 1804 loom follows chains of punched cards. A hole means lift this thread. Swap the cards and you get a new pattern."]],
 quote:["A program is just a pattern of holes that tells a machine what to do next.",""],next:"So if a loom can follow instructions… could a machine follow math?"},
engines:{hook:"Could you build a machine that thinks in numbers?",beats:[
 ["Charles Babbage tried. Twice.","The Difference Engine (1822) cranked out math tables. Then he dreamed bigger."],
 ["The Analytical Engine had a 'mill' and a 'store'.","That's a processor and memory, sketched in brass in the 1830s, and programmed with Jacquard cards."],
 ["Ada Lovelace saw further.","In 1843 she published a step-by-step method for the engine. Often called the first program, it came with a bigger idea: the machine could work with any symbols, even music."],
 ["Boole turned logic into algebra.","In 1854: true or false, combined with AND, OR and NOT. A century later, that becomes circuitry."]],
 quote:["The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers and leaves.","Ada Lovelace, 1843"],next:"But what can a machine compute, in principle?"},
theory:{hook:"Is there a limit to what any computer can do?",beats:[
 ["1936: Turing imagines a tape.","An endless strip of cells, a head that reads and writes one symbol, and a tiny rulebook."],
 ["That's enough to compute anything computable.","Every laptop, phone and data center is, in principle, that tape machine."],
 ["And some questions have no answer.","No program can always decide whether another program will ever finish. That's a proof, not a guess."],
 ["Shannon measures information.","His 1937 thesis wires Boole's logic into switches, and his 1948 paper makes the 'bit' a unit."]],
 quote:["We can only see a short distance ahead, but we can see plenty there that needs to be done.","Alan Turing, 1950"],next:"Then the theory went to war."},
codebreakers:{hook:"What happens when a war depends on a puzzle?",beats:[
 ["Enigma scrambled every letter.","Rotors stepped with each keypress, so the code changed constantly."],
 ["Bletchley Park fought back with machines.","Turing and Welchman's Bombe (1940), building on Polish breakthroughs, hunted for each day's settings."],
 ["Colossus, 1944.","Tommy Flowers' vacuum-tube machine cracked German high command traffic. It was the first programmable electronic digital computer, and a secret for 30 years."]],
 quote:["Breaking a code is a search problem. Machines are very good at searching.",""],next:"After the war, computers came out of hiding."},
electronic:{hook:"How big was the first famous computer?",beats:[
 ["About 27 tonnes.","ENIAC (1946): roughly 17,500 vacuum tubes, a room-sized machine reprogrammed by rewiring it by hand."],
 ["Six women made it work.","Its first programmers, including Kathleen McNulty, Jean Jennings and Betty Snyder, learned it from the wiring diagrams."],
 ["Then: put the program in memory.","Von Neumann's 1945 report describes the stored-program computer. The Manchester Baby ran one in 1948."]],
 quote:["Programs are just data. That one idea lets software write software.",""],next:"But tubes burned out. Something smaller was needed."},
transistor:{hook:"What if a switch had no moving parts at all?",beats:[
 ["December 1947: the transistor.","Bardeen, Brattain and Shockley at Bell Labs. A solid sliver of material that switches current. Cool, tiny, reliable."],
 ["1958–59: put many on one chip.","Kilby and Noyce invent the integrated circuit, printed onto silicon."],
 ["Moore notices a pattern.","Transistor counts double about every two years. Industry treats it as a promise for the next 50."],
 ["1971: a whole CPU on one chip.","The Intel 4004 has 2,300 transistors. Today's biggest chips have hundreds of billions."]],
 quote:["Switches controlling switches. That's all a computer is, all the way down.",""],next:"How small did these switches get? Let's zoom in and see."},
software:{hook:"Who tells the switches what to do?",beats:[
 ["Grace Hopper: write code in words.","Her A-0 compiler (1952) helped make programs readable by people, which led to COBOL."],
 ["FORTRAN, 1957.","John Backus's IBM team ships the first widely used high-level language. Scientists stop writing raw machine code."],
 ["UNIX and C, Bell Labs.","Thompson and Ritchie, from 1969. Their ideas still run inside your phone."],
 ["1991: Linux, free for anyone.","Linus Torvalds posts a hobby kernel. Open source becomes the backbone of the internet and of AI."]],
 quote:["Software is the part of the machine you can change with a thought.",""],next:"Then computers left the lab and landed on desks."},
personal:{hook:"When did computers become personal?",beats:[
 ["1968: the 'Mother of All Demos'.","Douglas Engelbart shows the mouse, hypertext and live collaboration, decades early."],
 ["Xerox PARC builds the future.","The Alto (1973) has windows, icons and a mouse. Visitors take notes."],
 ["Then it ships to everyone.","Apple II (1977), IBM PC (1981), Macintosh (1984), then Windows everywhere."]],
 quote:["Every icon you click hides a thousand layers of smaller machines.",""],next:"One computer is useful. What about all of them, connected?"},
network:{hook:"What's the first word ever sent over the internet's ancestor?",beats:[
 ["'LO'.","October 1969, UCLA to SRI. ARPANET crashed after two letters of 'LOGIN'."],
 ["1983: TCP/IP becomes the common language.","Cerf and Kahn's protocols cut messages into packets that find their own way."],
 ["1989–91: the Web.","Tim Berners-Lee adds pages, links and URLs on top. Suddenly anyone can publish."],
 ["2007: the internet fits in a pocket.","Smartphones and the cloud bring billions online, generating the data AI will learn from."]],
 quote:["A network of networks: the internet is recursion you can browse.",""],next:"With all that data… could machines learn?"},
ai1:{hook:"Can a machine learn instead of being told?",beats:[
 ["1956: the field gets a name.","The Dartmouth workshop coins 'artificial intelligence'. Optimism runs very high."],
 ["1958: the perceptron.","Frank Rosenblatt's machine learns by adjusting weights from examples."],
 ["Then: the AI winters.","Promises outran results, and funding froze in the 1970s and again in the late 1980s."],
 ["1986: backpropagation catches on.","Rumelhart, Hinton and Williams show how deep layers can learn from their mistakes."],
 ["1997: Deep Blue beats Kasparov.","The win came from brute-force search and hand-tuned rules, not learning. Still, a world champion lost to a machine."]],
 quote:["Learning is nudging numbers until mistakes get smaller.",""],next:"Learning worked in theory. It needed more data and more muscle."},
ai2:{hook:"What happens when you give learning enough data?",beats:[
 ["ImageNet: 14 million labeled photos.","Fei-Fei Li's dataset (2009) gives machines something big to learn from."],
 ["2012: AlexNet stuns the field.","A deep network trained on two gaming GPUs crushes the image-recognition contest."],
 ["Graphics cards turn into AI engines.","Thousands of tiny parallel cores, perfect for neural-network math."],
 ["2016: AlphaGo beats Lee Sedol.","Go has more possible positions than atoms in the observable universe, and a learning system mastered it."]],
 quote:["Data + compute + deep networks. The recipe finally worked.",""],next:"Then a single paper changed language itself."},
ai3:{hook:"How does a machine read a sentence?",beats:[
 ["2017: 'Attention Is All You Need'.","Eight Google researchers introduce the transformer."],
 ["Every word looks at every other word.","That's attention: deciding what matters for meaning, all at once and in parallel."],
 ["Predict the next token. At scale.","GPT, GPT-2, GPT-3… and scaling laws showed that bigger models got predictably better."],
 ["November 2022: ChatGPT.","Language models reach the public. Since then: images, audio, video, and agents that use tools."]],
 quote:["Attention lets every word ask: who else here matters to me?",""],next:"Meanwhile, the chips underneath were hitting a wall made of atoms."},
quantum:{hook:"What if the weirdness of atoms became the computer?",beats:[
 ["A qubit isn't 0 or 1.","It's a superposition, an arrow on a sphere. Measure it and it snaps to one answer."],
 ["Entangled qubits act as one.","n qubits are described by 2ⁿ numbers. Algorithms use interference so wrong answers cancel."],
 ["Shor (1994) and Grover (1996).","One could break today's RSA encryption on a big enough machine; the other speeds up search."],
 ["2019: Sycamore's milestone, disputed.","Google claimed a 200-second task would take a supercomputer 10,000 years. IBM said about 2.5 days, and classical methods later caught up a lot."],
 ["2024: errors finally shrink with scale.","Google's Willow showed error rates falling as codes grew, a key step. Useful machines still need far more qubits."]],
 quote:["Not faster at everything. Very different at a few things.",""],next:"So where is all of this heading?"}
};
