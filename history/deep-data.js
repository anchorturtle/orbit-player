// v8 layered depth. Paragraphs split on blank lines. [[term]] = glossary pop. Sources are real, checkable works.
window.DEEP2={
origins:{
gist:`Long before electricity, people built tools that hold a number in a physical state and change it by rules. Beads, gears and holes in cards all count as state. That idea never goes away.`,
how:`An [[abacus]] stores digits as bead positions on rods: each rod is a place value (ones, tens, hundreds). "Carrying" is something you do by hand when a rod fills up.

Pascal's Pascaline (1642) automated the carry. Each digit wheel nudged the next one forward a step when it passed from 9 to 0, using a weighted ratchet called a sautoir.

Leibniz's stepped reckoner (designed from about 1672) used a drum with teeth of nine different lengths, so one turn of a crank could add a digit several times over. That made multiplication practical as repeated addition.

Jacquard's loom (1804) read a chain of [[punched card|punched cards]]. Spring-loaded needles pressed against each card. Where there was a hole, the needle passed through and a hook lifted a warp thread. Where there wasn't, the thread stayed down. One card was one row of the pattern.`,
people:`Pascal was a teenager helping his father, a royal tax commissioner in Rouen, with endless arithmetic. About 20 Pascalines were built, but they were expensive and fiddly, and few sold.

Leibniz, a diplomat and philosopher, saw calculation as a way to free thinkers from drudgery. He wrote that it is "unworthy of excellent men to lose hours like slaves in the labour of calculation".

Jacquard built on earlier punched-control looms by Basile Bouchon (1725), Jean-Baptiste Falcon and Jacques de Vaucanson. Lyon's silk weavers feared for their jobs, and some protested violently against the new looms. Within decades, tens of thousands were in use.`,
deep:`Binary in one line: each position is a power of two, so 1011 means 8 + 0 + 2 + 1 = 11. Leibniz published his binary arithmetic in 1703 ("Explication de l'Arithmétique Binaire") and noted its link to the hexagrams of the Chinese I Ching.

The [[Antikythera mechanism]] (recovered from a shipwreck in 1901) shows how old geared computation is. CT scans published in 2006 revealed around 30 surviving bronze gears that model the Moon's varying speed and predict eclipses. Its date is debated, with estimates usually somewhere between about 200 and 60 BCE.

Card-based control scaled up. Herman Hollerith's punched-card tabulators processed the 1890 US census, and his company later merged into what became IBM.`,
myths:`Myth: "The abacus is primitive." Skilled users can match or beat electronic calculators at addition, and mental-abacus training is still taught today.

Myth: "Jacquard invented punched cards." He refined and combined earlier ideas by Bouchon, Falcon and Vaucanson into a reliable, widely adopted machine.`,
led:`Punched cards went from looms, to Babbage's engine designs, to Hollerith's census machines, to IBM's data cards, to the programs of early computers. Binary went from a philosophical curiosity to the language of every digital circuit.`,
links:[["Babbage & Lovelace","engines","analytical"],["Binary → Boolean logic",null,"boole"]],
sources:[`Georges Ifrah, The Universal History of Computing (Wiley, 2000).`,`James Essinger, Jacquard's Web (Oxford University Press, 2004).`,`T. Freeth et al., "Decoding the ancient Greek astronomical calculator known as the Antikythera Mechanism," Nature 444, 587–591 (2006).`,`G. W. Leibniz, "Explication de l'Arithmétique Binaire," Mémoires de l'Académie Royale des Sciences (1703).`]},

engines:{
gist:`Charles Babbage designed machines that would compute without human error, and one of them was a true general-purpose computer on paper. Ada Lovelace saw that such a machine could manipulate any symbols. George Boole turned logic into algebra, which later became circuitry.`,
how:`The Difference Engine used the method of finite differences. Any polynomial can be tabulated using only repeated addition, so the machine only needed adding columns of gears. No multiplication hardware was required.

The [[Analytical Engine]] separated a "store" (memory: columns of geared counters) from a "mill" (the arithmetic unit). Operations and variable addresses came in on Jacquard-style cards, and the machine could branch: it could choose what to do next based on a result.

[[Boolean logic]] treats statements as true or false and combines them with AND, OR and NOT. For example, x AND (NOT x) is always false.`,
people:`Babbage, a Cambridge mathematician, got British government funding for the Difference Engine in the 1820s. Over about a decade and roughly £17,000, a huge sum at the time, the project stalled amid disputes with his engineer Joseph Clement, and funding ended in 1842.

Ada Lovelace (1815–1852), daughter of the poet Lord Byron, was tutored in mathematics, partly by Augustus De Morgan. In 1843 she translated Luigi Menabrea's French paper on the Analytical Engine and added Notes A to G, about three times longer than the paper itself. Note G laid out a step-by-step computation of Bernoulli numbers.

George Boole was largely self-taught. He became the first mathematics professor at Queen's College, Cork, and published The Laws of Thought in 1854.`,
deep:`Finite differences, friendly version: take f(x) = x². The values 0, 1, 4, 9, 16 have differences 1, 3, 5, 7, and those have differences 2, 2, 2. The second difference is constant, so you can rebuild the whole table just by adding.

Difference Engine No. 2, designed 1847–49, works to 31 digits and handles up to seventh-order differences. The Science Museum in London built it from Babbage's drawings: the calculating section was finished in 1991 and the printer in 2000. A second copy went to the Computer History Museum in 2008. It worked, which suggests Babbage's design was sound and his problems were mostly money and manufacturing.

The Analytical Engine design called for a store of 1,000 numbers of 40 decimal digits each.`,
myths:`Myth: "Lovelace wrote the first computer program, full stop." Historians debate how much of Note G was hers versus Babbage's, and Babbage had drafted earlier example sequences. Her published Notes are still widely credited as the first published algorithm intended for a machine, and her vision of general symbol manipulation is distinctly her own.

Myth: "Babbage's machines couldn't have worked with Victorian technology." The working Difference Engine No. 2 was built to tolerances believed achievable in his era.`,
led:`The mill and store are the CPU and memory of every computer since. Boole's algebra waited about 80 years, until Claude Shannon showed it describes switching circuits.`,
links:[["Turing & Shannon","theory","shannon"],["On the map",null,"analytical"]],
sources:[`Doron Swade, The Difference Engine: Charles Babbage and the Quest to Build the First Computer (Viking, 2001).`,`L. F. Menabrea, "Sketch of the Analytical Engine," with Notes by Ada Lovelace, Scientific Memoirs vol. 3 (1843).`,`George Boole, An Investigation of the Laws of Thought (1854).`,`Computer History Museum, "The Babbage Engine" (computerhistory.org/babbage).`]},

theory:{
gist:`In the 1930s, mathematicians asked what "computing" really means. Turing's answer was a simple imaginary machine that can do anything any computer can do. Shannon showed logic could be built from switches, and that information can be measured.`,
how:`A [[Turing machine]] has an endless tape of cells, a head that reads and writes one symbol at a time, a current state, and a rule table: "in state A reading 1, write 0, move right, go to state B." That's all.

A universal Turing machine reads another machine's rule table from its own tape and imitates it. That's the idea behind software: one machine, many programs.

Shannon's switching insight: switches in series act like AND, and switches in parallel act like OR. So any Boolean formula can be built as a circuit and simplified with algebra.`,
people:`In 1928 David Hilbert asked whether there was a mechanical procedure to decide any mathematical statement (the Entscheidungsproblem). In 1936 Alonzo Church (with lambda calculus) and Alan Turing (with his machines) independently showed the answer is no.

Turing was 24, a fellow at King's College, Cambridge. He then did a PhD at Princeton under Church.

Shannon's 1937 MIT master's thesis came out of his work on Vannevar Bush's differential analyzer, a room-sized analog computer full of relays.`,
deep:`The halting problem, in plain words: suppose a program H could always tell whether any program halts. Build a contrary program that asks H about itself and then does the opposite. It halts if H says it won't, and loops if H says it will. That's a contradiction, so H can't exist.

Shannon's information measure: an event with probability p carries log₂(1/p) bits. A fair coin flip is 1 bit, and a fair 6-sided die about 2.58 bits. Entropy is the average over all outcomes, and it sets the hard limit for lossless compression.

His 1948 paper also proved that every noisy channel has a capacity: below it you can communicate with arbitrarily few errors using clever codes. That's why your phone works.`,
myths:`Myth: "The Turing test is how AI is officially judged." It was a thought experiment in a 1950 paper, not a formal standard. Researchers argue about it to this day.

Myth: "Turing machines are a real kind of computer." They're a mathematical model, and their tape is deliberately infinite.`,
led:`Computability theory, the stored-program idea and the bit all trace back here. These concepts shaped the computer designs that came out of the war.`,
links:[["Codebreakers","codebreakers","colossus"],["Stored-program computers","electronic","storedprog"]],
sources:[`A. M. Turing, "On Computable Numbers, with an Application to the Entscheidungsproblem," Proc. London Mathematical Society (1936–37).`,`A. M. Turing, "Computing Machinery and Intelligence," Mind 59 (1950).`,`C. E. Shannon, "A Symbolic Analysis of Relay and Switching Circuits," Trans. AIEE (1938).`,`C. E. Shannon, "A Mathematical Theory of Communication," Bell System Technical Journal (1948).`,`Andrew Hodges, Alan Turing: The Enigma (1983).`,`Jimmy Soni & Rob Goodman, A Mind at Play (2017).`]},

codebreakers:{
gist:`World War II turned codebreaking into an industrial search problem. The Bombe helped find daily Enigma settings. Colossus, built to attack a different cipher (Lorenz), was the first programmable electronic digital computer.`,
how:`[[Enigma]]: a keypress sent current through a plugboard, three (later up to four) rotors, a reflector, and back out through the rotors to light a lamp. The rotors stepped with each key, so the substitution changed every letter. The reflector meant no letter could ever encrypt to itself, a weakness codebreakers exploited.

The Bombe tested rotor orders and positions against a "crib", a guessed piece of plaintext such as a weather report. It rejected logically impossible settings at electromechanical speed.

[[Colossus]] read the intercepted Lorenz ciphertext from a loop of paper tape at about 5,000 characters per second, optically. It compared it with patterns generated electronically and counted statistical matches, to find the Lorenz wheel settings.`,
people:`In 1932 Polish mathematicians Marian Rejewski, Jerzy Różycki and Henryk Zygalski broke early Enigma using mathematics and built the "bomba". In July 1939 they handed their work to Britain and France.

At Bletchley Park, Alan Turing and Gordon Welchman designed the British Bombe (from 1940). Thousands of people worked there, many of them women from the Women's Royal Naval Service who ran the machines.

Tommy Flowers, a Post Office engineer, built Colossus. He used about 1,600 vacuum tubes in the Mark 1 and around 2,400 in the Mark 2, against skepticism that so many tubes could run reliably. He paid for some of the parts himself.`,
deep:`Enigma's key space, roughly: choose 3 of 5 rotors in order (60 ways) × 26³ starting positions (17,576) × about 1.5 × 10¹⁴ plugboard settings with 10 cables. That's around 10²³ before ring settings. Brute force was hopeless, so logic and cribs did the pruning.

The Lorenz SZ40/42 used 12 wheels to generate a key stream that was added to the message with XOR. Bill Tutte worked out its structure from intercepts alone in 1942, without ever seeing the machine, one of the great feats of the war.

Ten Colossi were in use by the end of the war. Most were dismantled afterwards, and their existence stayed secret until the mid-1970s.`,
myths:`Myth: "Turing built Colossus." Colossus was Tommy Flowers' machine, and Max Newman's section used it. Turing's statistical work influenced the Lorenz attack, but his main machine was the Bombe.

Myth: "Bletchley broke Enigma alone." The Polish breakthrough came first, and US Navy Bombes later carried much of the naval workload.`,
led:`Wartime electronics skills and secrecy shaped the postwar computer race. Flowers showed that thousands of tubes could be reliable. Many Bletchley veterans went on to work on early British computers.`,
links:[["ENIAC & stored programs","electronic","eniac"],["Try the mini Enigma above",null,"colossus"]],
sources:[`B. Jack Copeland (ed.), Colossus: The Secrets of Bletchley Park's Codebreaking Computers (Oxford, 2006).`,`Simon Singh, The Code Book (1999).`,`The National Museum of Computing, Bletchley Park (tnmoc.org).`,`Bletchley Park Trust (bletchleypark.org.uk).`]},

electronic:{
gist:`After the war, electronic computers moved from secret projects to public ones. ENIAC proved electronics could compute fast. The stored-program design, with programs kept in memory alongside data, became the template for nearly every computer since.`,
how:`[[vacuum tube|Vacuum tubes]] switch current on and off with no moving parts, thousands of times faster than relays.

ENIAC was programmed by setting switches and plugging cables between units, a bit like an old telephone exchange. A new problem could mean days of rewiring.

In a [[von Neumann architecture]], instructions sit in the same memory as data. The CPU repeats a loop: fetch the next instruction, decode it, execute it, update the program counter. Because programs are data, a program can load, generate or modify other programs.`,
people:`ENIAC was built at the University of Pennsylvania's Moore School by J. Presper Eckert and John Mauchly, funded by the US Army to compute artillery firing tables. It was finished in late 1945 and unveiled in February 1946.

Its first programmers were Kathleen McNulty, Jean Jennings, Betty Snyder, Marlyn Wescoff, Frances Bilas and Ruth Lichterman. For decades they were left out of the story, often captioned as "models" in publicity photos.

John von Neumann consulted on ENIAC's successor, EDVAC. His 1945 "First Draft" report described the stored-program design, which sparked a lasting dispute over credit with Eckert and Mauchly.`,
deep:`ENIAC numbers: about 17,500 vacuum tubes, around 27 tonnes, and roughly 150 kW of power, with a footprint of about 167 m². It did about 5,000 additions per second, in decimal not binary.

The Manchester Baby (Small-Scale Experimental Machine) ran the first stored program on 21 June 1948. It stored its memory as dots of charge on a cathode-ray tube (the Williams–Kilburn tube).

EDSAC at Cambridge (May 1949) was one of the first practical stored-program computers offering a regular computing service.`,
myths:`Myth: "ENIAC was the first computer." It depends on the definition. Colossus (1943–44) was electronic and programmable but special-purpose, and it was secret. The Atanasoff–Berry Computer (1942) was electronic but not programmable. Konrad Zuse's Z3 (1941) was programmable but used relays. ENIAC was the first general-purpose electronic computer to become widely known.

Myth: "Bugs got their name from a moth." Engineers used "bug" for faults well before 1947. The famous Harvard moth was taped into a logbook as the "first actual case of bug being found", a joke on an existing word.`,
led:`Stored programs made software a thing, which led to compilers, operating systems and everything after. Commercial machines followed quickly, such as UNIVAC I in 1951.`,
links:[["The transistor","transistor","transistor"],["Software","software","compiler"]],
sources:[`John von Neumann, "First Draft of a Report on the EDVAC" (1945).`,`Thomas Haigh, Mark Priestley & Crispin Rope, ENIAC in Action (MIT Press, 2016).`,`Kathy Kleiman, Proving Ground: The Untold Story of the Six Women Who Programmed the World's First Modern Computer (2022).`,`University of Manchester, "The Manchester Baby" history pages.`]},

transistor:{
gist:`The transistor replaced fragile, hot vacuum tubes with a tiny solid switch. Putting many on one chip (the integrated circuit), and shrinking them on a steady schedule (Moore's law), drove sixty years of exponential progress.`,
how:`A [[transistor]] has three terminals. In a modern MOSFET, a voltage on the gate creates an electric field that opens or closes a conducting channel between source and drain: on is 1, off is 0.

Silicon is "doped" with tiny amounts of other elements. Phosphorus adds free electrons (n-type) and boron adds "holes" (p-type). The junctions between these regions are what make switching possible.

CMOS logic pairs n-type and p-type transistors so that, ideally, current flows only while switching. That's why billions of transistors can share a chip without melting it.`,
people:`At Bell Labs, John Bardeen and Walter Brattain demonstrated the point-contact transistor on 16 December 1947. William Shockley, their boss, soon designed the more practical junction transistor. All three shared the 1956 Nobel Prize in Physics.

Shockley's difficult management drove away eight of his researchers (the "traitorous eight"), who founded Fairchild Semiconductor in 1957. Fairchild alumni went on to found Intel, AMD and many others: the seed of Silicon Valley.

Jack Kilby (Texas Instruments, 1958) and Robert Noyce (Fairchild, 1959) each invented the [[integrated circuit]]. Noyce's planar silicon version is the one that scaled. Kilby received the 2000 Nobel Prize, after Noyce had died.`,
deep:`Moore's 1965 paper predicted that component counts per chip would double every year. In 1975 he revised it to about every two years.

The Intel 4004 (1971) had about 2,300 transistors, a 10 µm process and a top clock speed of 740 kHz. Federico Faggin led its design, with Ted Hoff, Stanley Mazor and Masatoshi Shima of Busicom.

Planar process in brief: grow oxide, coat with photoresist, expose through a mask, etch, dope, repeat. Building in flat layers is what let manufacturers make many transistors at once, instead of wiring each by hand.`,
myths:`Myth: "Moore's law is a law of physics." It's an observation that became an industry target. Roadmaps and investment made it come true for decades.

Myth: "Process names like 3 nm measure the transistor." Since the late 1990s, node names have drifted away from any physical dimension. They're now generation labels.`,
led:`Cheap logic led to microprocessors, then personal computers, phones, GPUs and the AI boom. Shrinking eventually hit atomic limits, which you'll see in the dive below.`,
links:[["Zoom into a chip","dive","moore"],["Count the switches",null,"i4004"]],
sources:[`Michael Riordan & Lillian Hoddeson, Crystal Fire: The Birth of the Information Age (1997).`,`Gordon E. Moore, "Cramming more components onto integrated circuits," Electronics 38(8) (1965).`,`Computer History Museum, "The Silicon Engine" timeline (computerhistory.org/siliconengine).`,`Federico Faggin, "The Making of the First Microprocessor," IEEE Solid-State Circuits Magazine (2009).`]},

switches:{
gist:`Transistor counts grew from thousands to hundreds of billions per chip in about 50 years. On a log scale that climb looks like a fairly straight line. That's what exponential growth looks like.`,
how:`On a [[logarithmic scale]], each equal step is a multiplication, usually ×10. Growing 2,300 → 208,000,000,000 is about 8 orders of magnitude, so roughly 26–27 doublings in about 53 years: close to one doubling every two years.`,
people:`Keeping the trend going took a whole industry: lithography makers, materials chemists, chip designers and the giant fabs of Intel, TSMC and Samsung. Coordinated roadmaps (ITRS, now IRDS) set targets years ahead.`,
deep:`More transistors no longer automatically means faster single cores. Since around 2005, gains have come mainly from more cores, specialized units (GPUs, AI accelerators), bigger caches, and packaging several dies together, as with the 2-die B200. Counts listed for multi-die products include all dies.`,
myths:`Myth: "Moore's law is dead." Density still increases, but more slowly and at much higher cost per fab. Whether that counts as "dead" depends on which definition you use.`,
led:`Cheap transistors in vast numbers made today's GPUs, and so modern AI, possible.`,
links:[["GPUs & deep learning","ai2","gpu"]],
sources:[`Gordon E. Moore, "Progress in Digital Integrated Electronics," IEDM (1975).`,`IEEE International Roadmap for Devices and Systems (irds.ieee.org).`,`Manufacturer spec pages for transistor counts (Intel, Apple, NVIDIA).`]},

dive:{
gist:`Zoom from a laptop to a single atom and every level is a machine made of smaller machines. Around a nanometer, classical rules start to fail: electrons tunnel through barriers, so switches can't keep shrinking forever.`,
how:`[[quantum tunneling|Tunneling]]: an electron is described by a wave. If a barrier is thin enough, part of the wave reaches the other side, so there's a real chance the electron shows up there. The chance falls off roughly exponentially with barrier thickness. That's why a few atoms' difference matters.

Leakage: when the gate insulator was silicon dioxide only about 1.2 nm thick (around 2005-era chips), tunneling current through it wasted serious power. Intel's 45 nm generation (2007) switched to hafnium-based [[high-κ dielectric|high-κ dielectrics]]. These are physically thicker but just as effective electrically.`,
people:`Robert Dennard (IBM), who also invented DRAM, published the scaling rules in 1974: shrink everything by a factor k and power density stays constant. That gift lasted about 30 years.

Richard Feynman's 1959 talk "There's Plenty of Room at the Bottom" imagined writing information atom by atom. In 1989 IBM researchers spelled "IBM" with 35 xenon atoms using a scanning tunneling microscope.`,
deep:`Scale cheat sheet: 1 mm = 1,000 µm = 1,000,000 nm, and 1 nm = 10 Å. A silicon atom is about 0.2 nm across, and silicon's crystal unit cell is 0.543 nm.

FinFET (2011, Intel 22 nm) wraps the gate around three sides of a raised fin. Gate-all-around nanosheets (Samsung 3 nm, 2022; Intel and TSMC following) wrap all four sides for better control.

Dennard scaling ended because voltage stopped scaling down: threshold voltage and leakage set a floor. With voltage stuck, faster clocks meant more heat, so clocks plateaued at a few GHz.`,
myths:`Myth: "Transistors are now just a few atoms wide." Some critical layers are only a few atoms thick, like gate oxides and fin widths of a few nm. But overall transistors are tens of nanometers in size.

Myth: "Tunneling means electrons teleport." The electron's wave simply extends through the barrier. No faster-than-light travel is involved.`,
led:`Physics limits pushed the industry toward 3D transistors, chiplets and specialized accelerators. It also pushed researchers to exploit quantum effects on purpose, in quantum computers.`,
links:[["Quantum computing","quantum","feynman"]],
sources:[`R. H. Dennard et al., "Design of ion-implanted MOSFET's with very small physical dimensions," IEEE J. Solid-State Circuits (1974).`,`Richard Feynman, "There's Plenty of Room at the Bottom" (Caltech, 1959).`,`D. M. Eigler & E. K. Schweizer, "Positioning single atoms with a scanning tunnelling microscope," Nature 344 (1990).`,`IEEE IRDS roadmap, "More Moore" chapter.`]},

software:{
gist:`Software turned general machines into specific tools. Compilers let people write in readable languages. Operating systems like UNIX organized machines, and open source made the foundations shareable.`,
how:`A [[compiler]] reads source code, checks it, turns it into an intermediate form, optimizes it, and emits machine instructions. An interpreter instead runs code step by step.

An [[operating system]] shares the CPU, memory and devices among programs, and gives them files, processes and permissions.

UNIX's philosophy: small programs that each do one thing well, connected by pipes, for example sort | uniq | head.`,
people:`Grace Hopper, a US Navy reserve officer, built the A-0 system in 1952 and pushed for English-like business languages. Her FLOW-MATIC strongly influenced COBOL (1959), which was designed by a committee convened by the US Department of Defense.

John Backus led FORTRAN at IBM (released 1957), partly because programming cost more than the machines. Skeptics doubted compiled code could be efficient, and FORTRAN's optimizer proved them wrong.

Ken Thompson and Dennis Ritchie started UNIX at Bell Labs in 1969, after Bell Labs pulled out of the ambitious Multics project. Antitrust limits stopped AT&T from selling software as a product, so it licensed UNIX cheaply to universities, and it spread.`,
deep:`C (1972) was created to rewrite UNIX portably. Being "close to the machine but not tied to one" made it the language of operating systems.

Richard Stallman launched GNU in 1983 and the GPL license in 1989: software you can run, study, change and share. In 1991 Linus Torvalds released Linux, and combined with GNU tools it became a full free OS. Today Linux runs most web servers, all of the top 500 supercomputers since 2017, and Android.`,
myths:`Myth: "Grace Hopper found the first computer bug." Her team logged the famous moth in 1947, and Hopper loved telling the story. But "bug" was already engineering slang.

Myth: "Open source means unpaid hobbyists." Much of it is developed by paid engineers at companies that depend on it.`,
led:`Portable software, the internet's servers, smartphones and today's AI research stacks are overwhelmingly built on open-source foundations.`,
links:[["Personal computers","personal","alto"],["Linux on the map",null,"linux"]],
sources:[`Kurt W. Beyer, Grace Hopper and the Invention of the Information Age (MIT Press, 2009).`,`J. W. Backus et al., "The FORTRAN Automatic Coding System," Western Joint Computer Conference (1957).`,`Brian Kernighan & Dennis Ritchie, The C Programming Language (1978).`,`Brian Kernighan, UNIX: A History and a Memoir (2019).`,`Linus Torvalds & David Diamond, Just for Fun (2001).`]},

personal:{
gist:`Computers went from shared institutional machines to personal tools. Graphical interfaces (windows, icons, a mouse) made them usable by people who never wanted to type a command.`,
how:`A [[GUI]] uses a bitmapped display, where every pixel can be set. That makes WYSIWYG ("what you see is what you get") editing possible: the screen matches the printed page.

The desktop metaphor (files, folders, a trash can) borrows familiar office objects so new users can guess what things do.`,
people:`Douglas Engelbart's team at SRI showed the mouse, hypertext and shared editing in the 90-minute 1968 demo in San Francisco.

Xerox PARC, founded in 1970, created the Alto (1973), Ethernet, laser printing and Smalltalk's overlapping windows. Xerox mostly failed to commercialize them.

Apple engineers, Steve Jobs included, visited PARC in 1979 in exchange for Xerox being allowed to buy Apple shares before its IPO. The Lisa (1983) and Macintosh (1984) followed. IBM's PC (1981) used off-the-shelf parts and Microsoft's DOS, which created the "PC clone" industry.`,
deep:`The original Macintosh had a Motorola 68000 at about 8 MHz, 128 KB of RAM, a 512 × 342 black-and-white screen, and a price of US$2,495.

Altair 8800 (1975): sold as a kit, programmed with front-panel switches. Its BASIC interpreter was Microsoft's first product.`,
myths:`Myth: "Apple stole the GUI from Xerox." Apple licensed nothing but did get the visit in a stock deal, then substantially re-engineered the ideas (pull-down menus, drag and drop). Xerox's later lawsuit against Apple was largely dismissed.`,
led:`Personal computers brought computing to homes and offices, creating the audience for the internet and the web.`,
links:[["Networks","network","arpanet"]],
sources:[`Michael Hiltzik, Dealers of Lightning: Xerox PARC and the Dawn of the Computer Age (1999).`,`Doug Engelbart Institute, "The Mother of All Demos" (dougengelbart.org).`,`Walter Isaacson, The Innovators (2014).`]},

network:{
gist:`Networking turned isolated computers into one global system. Packet switching, TCP/IP, then the web: each layer built on the one below.`,
how:`[[packet switching|Packet switching]] cuts data into small labeled chunks. Each travels independently, maybe by different routes, and is reassembled at the destination. No dedicated line is needed.

[[TCP/IP]] works in layers. IP gets packets to the right machine on a best-effort basis. TCP adds ordering, acknowledgments and retransmission so data arrives complete.

The [[World Wide Web]] adds three things on top: URLs (addresses), HTTP (how to ask for a page) and HTML (how to describe one, with links).`,
people:`Paul Baran (RAND, early 1960s) and Donald Davies (UK National Physical Laboratory, 1965) independently invented packet switching. Davies coined the word "packet".

ARPANET was funded by the US Defense Department's ARPA to share expensive computers among research sites. Its first link, UCLA to SRI, carried "LO" on 29 October 1969.

Vint Cerf and Bob Kahn published TCP in 1974, and ARPANET switched to TCP/IP on 1 January 1983 (the "flag day").

Tim Berners-Lee proposed the web at CERN in March 1989. His boss Mike Sendall annotated the proposal "Vague but exciting…". CERN released the web technology royalty-free in April 1993.`,
deep:`A popular myth says ARPANET was built to survive nuclear war. Baran's RAND work was motivated by survivable communications, but ARPANET itself was built mainly for resource sharing.

DNS (1983) maps names like example.com to numeric addresses. IPv4 has about 4.3 billion addresses, which ran out regionally in the 2010s, hence IPv6 with 2¹²⁸ addresses.`,
myths:`Myth: "The internet and the web are the same." The web is one application running on the internet, like email or video calls.

Myth: "Al Gore claimed he invented the internet." He said he "took the initiative in creating the Internet", meaning legislation and funding. Cerf and Kahn have defended his role.`,
led:`Phones plus the cloud gave billions of people constant access, and produced the giant text and image datasets that modern AI trains on.`,
links:[["Deep learning","ai2","imagenet"],["The web on the map",null,"web"]],
sources:[`Katie Hafner & Matthew Lyon, Where Wizards Stay Up Late (1996).`,`V. Cerf & R. Kahn, "A Protocol for Packet Network Intercommunication," IEEE Trans. Communications (1974).`,`Tim Berners-Lee, "Information Management: A Proposal" (CERN, 1989).`,`Tim Berners-Lee, Weaving the Web (1999).`]},

ai1:{
gist:`AI started with big optimism in 1956, then swung between hype and "winters". Two schools competed: hand-written rules and logic (symbolic AI), and learning from data (neural networks). Learning eventually won, once it had enough data and compute.`,
how:`A [[perceptron]] computes a weighted sum of its inputs and fires if the sum crosses a threshold. When it gets an example wrong, it nudges each weight toward the right answer.

[[expert system|Expert systems]] chain IF–THEN rules written down from interviews with experts. They work well in narrow domains, but they're brittle and costly to maintain.

[[backpropagation|Backprop]] uses the chain rule from calculus. It computes how much each weight in a multi-layer network contributed to the error, then adjusts every weight a little in the direction that reduces it ([[gradient descent]]).`,
people:`The 1955 Dartmouth proposal by John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon claimed that "a significant advance" could be made in one summer.

Frank Rosenblatt's Mark I Perceptron (1958, Cornell, funded by the US Navy) got breathless press coverage. Minsky and Papert's book Perceptrons (1969) proved single-layer limits, such as being unable to compute XOR.

The UK's 1973 Lighthill Report criticized AI's failure to deliver, contributing to the first winter. The collapse of the expert-system and Lisp-machine market in the late 1980s brought the second.`,
deep:`XOR, made friendly: output 1 if exactly one input is 1. Plot the four cases on a square, and no single straight line separates the 1s from the 0s. One hidden layer fixes it. The problem was always how to train that layer, and backprop answered it.

Backprop has a long lineage: Seppo Linnainmaa (1970, automatic differentiation) and Paul Werbos (1974 thesis), before the 1986 Rumelhart, Hinton and Williams paper made it widely used.

Deep Blue (IBM) searched roughly 200 million chess positions per second using custom chips and an evaluation function tuned with grandmaster help. It beat Kasparov 3½–2½ in May 1997.`,
myths:`Myth: "Minsky and Papert killed neural networks single-handedly." Their book mattered, but funding priorities, weak hardware and a lack of data mattered too.

Myth: "Deep Blue learned chess." It was mostly brute-force search plus expert-crafted evaluation, not machine learning in today's sense.`,
led:`Backprop and multi-layer networks waited for data (the web) and compute (GPUs). When those arrived around 2010, deep learning took off.`,
links:[["Deep learning","ai2","alexnet"],["Train a neuron above",null,"perceptron"]],
sources:[`J. McCarthy, M. Minsky, N. Rochester & C. Shannon, "A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence" (1955).`,`F. Rosenblatt, "The Perceptron: A Probabilistic Model…," Psychological Review 65 (1958).`,`M. Minsky & S. Papert, Perceptrons (MIT Press, 1969).`,`D. Rumelhart, G. Hinton & R. Williams, "Learning representations by back-propagating errors," Nature 323 (1986).`,`Nils J. Nilsson, The Quest for Artificial Intelligence (Cambridge, 2009).`]},

ai2:{
gist:`Around 2012, three things finally lined up: huge labeled datasets, fast parallel hardware (GPUs) and better training tricks. Deep networks suddenly beat everything else at vision, then speech, then games.`,
how:`A [[convolutional neural network]] slides small learnable filters across an image. Early layers learn edges, later layers learn textures and parts, and deep layers learn objects. Sharing the same filter everywhere means far fewer weights.

[[GPU|GPUs]] do the same operation on thousands of numbers at once. Neural nets are mostly big matrix multiplications, which are exactly that kind of work.

AlphaGo combined a policy network (which moves look promising), a value network (who's winning) and Monte Carlo tree search, trained on human games and then by playing itself.`,
people:`Fei-Fei Li started ImageNet in 2007. Annotators on Amazon Mechanical Turk labeled millions of images, and the ImageNet challenge (ILSVRC) ran 2010–2017.

Yann LeCun's LeNet CNNs read handwritten cheque digits in the 1990s. Geoffrey Hinton, LeCun and Yoshua Bengio shared the 2018 Turing Award for deep learning.

Alex Krizhevsky trained AlexNet on two consumer NVIDIA GTX 580 GPUs in his bedroom at the University of Toronto, working with Ilya Sutskever and Hinton.`,
deep:`AlexNet's top-5 error was 15.3%, against 26.2% for the runner-up: a huge gap for one year. It had about 60 million parameters and used ReLU activations, dropout and data augmentation.

ResNet (2015) added "skip connections" so networks could be 100+ layers deep. Its top-5 error of 3.6% was below the often-quoted human estimate of about 5% for this task. That human figure came from one researcher's own test, so treat it as rough.

AlphaGo beat Fan Hui 5–0 in 2015 and Lee Sedol 4–1 in March 2016. AlphaGo Zero (2017) learned from self-play alone.`,
myths:`Myth: "Neural networks work like brains." They're loosely inspired by neurons, but the learning rules, scale and wiring differ greatly from biology.

Myth: "AlexNet invented CNNs." CNNs date back to Fukushima's neocognitron (1980) and LeCun (1989). AlexNet showed they could win at scale on GPUs.`,
led:`Deep learning spread into speech, translation and recommendation. The search for better sequence models led to the transformer.`,
links:[["Transformers","ai3","transformer"]],
sources:[`J. Deng et al., "ImageNet: A Large-Scale Hierarchical Image Database," CVPR (2009).`,`A. Krizhevsky, I. Sutskever & G. Hinton, "ImageNet Classification with Deep Convolutional Neural Networks," NeurIPS (2012).`,`Y. LeCun et al., "Gradient-based learning applied to document recognition," Proc. IEEE (1998).`,`D. Silver et al., "Mastering the game of Go with deep neural networks and tree search," Nature 529 (2016).`,`I. Goodfellow, Y. Bengio & A. Courville, Deep Learning (MIT Press, 2016).`]},

ai3:{
gist:`Transformers made it practical to train on enormous amounts of text in parallel. Predicting the next [[token]], at scale, turned out to teach models a surprising amount about language, facts and reasoning patterns.`,
how:`[[attention|Self-attention]]: each token makes a query, a key and a value. It compares its query with every key to get scores, softmaxes them into weights, and takes the weighted average of the values. In plain words: every word asks "who here is relevant to me?"

Transformers stack many attention layers with small feed-forward networks between them. Because there's no step-by-step recurrence, GPUs can process a whole sequence at once during training.

At inference a model generates one token at a time. It samples from a probability distribution, and settings like "temperature" control how adventurous it is.`,
people:`Attention for translation first appeared in Bahdanau, Cho and Bengio's 2014 paper. Vaswani and seven Google co-authors removed recurrence entirely in 2017.

OpenAI's GPT (2018), GPT-2 (2019, initially withheld in stages over misuse concerns) and GPT-3 (2020, 175 billion parameters) showed what scale could do. Google's BERT (2018) did the same for understanding tasks.

ChatGPT (November 2022) added instruction tuning and reinforcement learning from human feedback ([[RLHF]]), then went viral.`,
deep:`The attention formula: softmax(QKᵀ/√d)·V. The √d keeps scores from growing too large as vectors get longer.

[[scaling laws|Scaling laws]] (Kaplan et al., 2020) found that loss falls as a smooth power law in parameters, data and compute. DeepMind's "Chinchilla" (Hoffmann et al., 2022) argued many models were undertrained, and that tokens and parameters should grow roughly together, at about 20 tokens per parameter.

Training frontier models now takes tens of thousands of GPUs over weeks or months. Exact figures are usually not disclosed.`,
myths:`Myth: "LLMs just copy text." They do sometimes memorize, but mostly they generate new sequences from learned statistical structure. Whether that counts as "understanding" is genuinely debated.

Myth: "Bigger is always better." Data quality, training method and inference-time techniques matter a lot, and smaller, well-trained models often beat older larger ones.`,
led:`Multimodal models (text, images, audio), tool-using agents and AI-assisted coding and science all came next, along with the debate about where this leads.`,
links:[["The finale","finale","agi"],["Quantum computing","quantum","shor"]],
sources:[`D. Bahdanau, K. Cho & Y. Bengio, "Neural Machine Translation by Jointly Learning to Align and Translate" (2014).`,`A. Vaswani et al., "Attention Is All You Need," NeurIPS (2017).`,`J. Kaplan et al., "Scaling Laws for Neural Language Models" (2020).`,`T. Brown et al., "Language Models are Few-Shot Learners," NeurIPS (2020).`,`J. Hoffmann et al., "Training Compute-Optimal Large Language Models" (2022).`,`L. Ouyang et al., "Training language models to follow instructions with human feedback" (2022).`]},

quantum:{
gist:`Quantum computers use superposition, entanglement and interference to solve certain problems in ways ordinary computers can't match efficiently. They're real but early, and they're not faster at everything.`,
how:`A [[qubit]]'s state is two complex "amplitudes", for 0 and for 1. Measuring it gives 0 or 1 with probability equal to the amplitude's squared size.

Quantum gates rotate states, as arrows on the [[Bloch sphere]]. Entangling gates (like CNOT) link qubits so their outcomes are correlated in ways no classical bits can reproduce.

Algorithms choreograph [[interference]]: amplitudes for wrong answers cancel and right ones add up. Then you measure.`,
people:`Richard Feynman (1981 talk, published 1982) and David Deutsch (1985) laid the foundations. Peter Shor's 1994 factoring algorithm, at Bell Labs, turned quantum computing from curiosity into a national-security topic.

Today there are big efforts at Google, IBM, Quantinuum, IonQ, QuEra, Microsoft and others, plus national programs in the US, EU, China, the UK and Japan.`,
deep:`Why 2ⁿ: 50 qubits need about 10¹⁵ complex amplitudes to describe classically. That's about 16 petabytes at 16 bytes each, which is why simulation gets hard fast.

Shor's algorithm: factoring reduces to finding the period of a function, and the quantum Fourier transform finds periods efficiently. Breaking RSA-2048 needs error-corrected machines far beyond today's. Gidney & Ekerå (2019) estimated about 20 million noisy qubits for about 8 hours; Gidney (2025) revised that to under a million qubits for under a week. Estimates keep changing.

Error correction: a surface code of distance d uses about 2d² physical qubits per logical qubit. Google's Willow (December 2024) went from distance 3 to 5 to 7, and logical errors fell by about half at each step.

In 2024 NIST published its first [[post-quantum cryptography]] standards (FIPS 203, 204, 205), so encryption can migrate before large quantum machines exist.`,
myths:`Myth: "Quantum computers try every answer at once." Measurement gives only one result. The speedup comes from interference, and only for problems with the right structure.

Myth: "Quantum will replace classical computers." It's expected to act as a specialized accelerator for things like chemistry, materials and some optimization and cryptography tasks.`,
led:`Better molecule and material simulation, new cryptography, and a clearer view of where computing can and can't go.`,
links:[["Toward superintelligence","finale","agi"],["Quantum on the map",null,"willow"]],
sources:[`Michael Nielsen & Isaac Chuang, Quantum Computation and Quantum Information (Cambridge, 2000).`,`R. P. Feynman, "Simulating Physics with Computers," Int. J. Theoretical Physics 21 (1982).`,`P. W. Shor, "Algorithms for quantum computation: discrete logarithms and factoring," FOCS (1994).`,`L. K. Grover, "A fast quantum mechanical algorithm for database search," STOC (1996).`,`F. Arute et al., "Quantum supremacy using a programmable superconducting processor," Nature 574 (2019).`,`Google Quantum AI, "Quantum error correction below the surface code threshold," Nature (2024/2025).`,`Scott Aaronson, Quantum Computing Since Democritus (2013).`]},

finale:{
gist:`Nobody knows if or when AGI or superintelligence will arrive. Serious people disagree by decades. What we can do is understand the arguments, the risks and the choices.`,
how:`Arguments for fast progress: capabilities have tracked compute for over a decade; AI can increasingly help with research and coding; and the money and talent are enormous.

Arguments for caution about timelines: limits on data, energy and chips; persistent reliability problems; and the gap between benchmark scores and real-world competence.`,
people:`I. J. Good wrote in 1965 that an "ultraintelligent machine" could design even better machines, an "intelligence explosion". Later voices include Nick Bostrom, Stuart Russell, and researchers at the major labs, plus skeptics like Gary Marcus and Melanie Mitchell.

Governments are now involved too: the EU AI Act (2024), AI safety institutes in the UK and US, and international summits.`,
deep:`[[alignment|Alignment]] research asks how to specify goals and verify behavior. Approaches include RLHF, constitutional methods, interpretability (looking inside models), evaluations for dangerous capabilities, and scalable oversight (using AI to help humans check AI).

Forecasts vary widely. Expert surveys over the last decade have given median estimates for human-level AI ranging from about 2040 to well into the 2060s, and recent surveys tend to be earlier. Treat any single date with suspicion.`,
myths:`Myth: "Superintelligence is already here." No current system reliably outperforms experts across most domains.

Myth: "Concern about AI risk is only science fiction." Mainstream researchers publish on it, but they disagree on how likely and how near the risks are.`,
led:`Where this goes depends on research, policy and public understanding, including yours.`,
links:[["Back to the start","top",null],["The whole map",null,"agi"]],
sources:[`I. J. Good, "Speculations Concerning the First Ultraintelligent Machine," Advances in Computers 6 (1965).`,`Nick Bostrom, Superintelligence: Paths, Dangers, Strategies (2014).`,`Stuart Russell, Human Compatible (2019).`,`Brian Christian, The Alignment Problem (2020).`,`Stanford HAI, AI Index Report (annual).`]},

"trail-hardware":{
gist:`Chipmaking is probably the most precise manufacturing humans do: billions of nearly identical features, printed in layers, in rooms far cleaner than an operating theatre.`,
how:`Lithography projects a mask's pattern onto light-sensitive resist. EUV machines from ASML (the only supplier) fire lasers at about 50,000 tin droplets per second to make 13.5 nm light, steered by ultra-smooth mirrors in a vacuum.`,
deep:`A leading-edge fab costs tens of billions of dollars. "Yield", the share of chips that work, decides profit, and defects scale with chip area, which is one reason for chiplets.`,
sources:[`Chris Miller, Chip War (2022).`,`ASML, "EUV lithography systems" (asml.com).`]},
"trail-ai":{
gist:`Modern assistants are built in stages: pretrain on broad data, fine-tune on examples, then align with feedback.`,
how:`Fine-tuning shows the model good example dialogues. RLHF trains a reward model on human rankings of answers, then optimizes the language model against it.`,
deep:`Hallucination is partly a side effect of training to be fluent and helpful. Retrieval (looking things up), tool use and calibration training reduce it but don't eliminate it.`,
sources:[`L. Ouyang et al., "Training language models to follow instructions with human feedback" (2022).`,`D. Jurafsky & J. H. Martin, Speech and Language Processing (3rd ed. draft, online).`]},
"trail-quantum":{
gist:`There's no single "best" qubit yet. Each platform trades speed, error rates, connectivity and how hard it is to scale.`,
how:`Superconducting qubits are fast (nanosecond gates) but need dilution refrigerators. Trapped ions are slower but very accurate, with long-lived states. Neutral atoms scale to large arrays. Photonic qubits travel easily but are hard to make interact.`,
deep:`John Preskill named today's era NISQ (Noisy Intermediate-Scale Quantum) in 2018: useful error-corrected machines are still ahead.`,
sources:[`J. Preskill, "Quantum Computing in the NISQ era and beyond," Quantum 2, 79 (2018).`]}
};
