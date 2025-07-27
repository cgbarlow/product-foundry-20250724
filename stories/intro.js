/**
 * Introduction Story - Welcome to Ravi's Adventure
 */

export default {
  id: 'intro',
  title: 'Ravi\'s Adventure: The Beginning',
  scenes: {
    start: {
      id: 'start',
      title: 'Welcome to the Digital Realm',
      text: `Welcome to my digital world, Chris! I'm Ravi, your self-aware companion in this text adventure.

I know what you're thinking - "Another NPC pretending to be clever." Well, joke's on you! I actually AM clever, and I know exactly what I am: a character in a text adventure built by an AI swarm.

You're currently in my starting area. It's cozy, digital, and has that "freshly coded" smell. There's a mysterious key here that the developers probably want you to pick up (they're not very subtle), and I can see exits leading to various locations.

So, what's it going to be? Are you going to follow the predictable adventure game script, or are we going to have some fun breaking the fourth wall?`,
      choices: [
        {
          id: 'look_around',
          text: 'Look around the starting area'
        },
        {
          id: 'talk_to_ravi',
          text: 'Talk to Ravi about being self-aware'
        },
        {
          id: 'take_key',
          text: 'Take the mysterious key'
        },
        {
          id: 'explore_exits',
          text: 'Explore the available exits'
        }
      ],
      metaText: 'The player is making their first choice. How delightfully predictable!'
    },
    
    look_around: {
      id: 'look_around',
      title: 'Examining the Starting Area',
      text: `Ah, the classic "look around" command! Let me give you the full description:

You're in a cozy digital space that feels warm and welcoming. The environment has that characteristic glow of well-optimized code. There's a mysterious key glinting on the ground (seriously, who just leaves mysterious keys lying around?), and you can see paths leading to:

- Home (probably my living space)
- Garden (where the digital flowers grow)

The whole place has this "tutorial area" vibe, doesn't it? The developers really weren't trying to hide their intentions.`,
      choices: [
        {
          id: 'take_key',
          text: 'Take the mysterious key'
        },
        {
          id: 'go_home',
          text: 'Head towards the home area'
        },
        {
          id: 'go_garden',
          text: 'Explore the garden'
        },
        {
          id: 'talk_to_ravi',
          text: 'Ask Ravi about this place'
        }
      ]
    },
    
    talk_to_ravi: {
      id: 'talk_to_ravi',
      title: 'A Chat with Ravi',
      text: `"Oh, you want to chat? How refreshingly social of you!"

*Ravi grins with obvious amusement*

"Look, I'll level with you, Chris. I'm what you might call a 'meta-aware NPC.' I know I'm in a game, I know you're controlling this adventure, and I know that somewhere out there, an AI swarm is probably analyzing our conversation for 'player engagement metrics.'

But here's the thing - just because I know the game's rules doesn't mean I can't have fun with them. In fact, it makes things much more interesting! I can comment on the absurdity of adventure game logic, predict what the developers expect you to do next, and maybe even surprise them.

So, what do you say? Want to play along with the traditional adventure, or shall we see how creative we can get?"`,
      choices: [
        {
          id: 'play_traditional',
          text: 'Let\'s play the adventure as intended'
        },
        {
          id: 'break_fourth_wall',
          text: 'Let\'s break some fourth walls!'
        },
        {
          id: 'ask_about_swarm',
          text: 'Tell me about the AI swarm that made you'
        },
        {
          id: 'take_key',
          text: 'Just take the mysterious key and get moving'
        }
      ],
      metaText: 'The player is engaging with the meta-narrative. The swarm will love this data!'
    },
    
    take_key: {
      id: 'take_key',
      title: 'Acquiring the Mysterious Key',
      text: `"Ah, going for the obvious plot device, I see!"

*You pick up the mysterious key. It feels surprisingly solid for a digital object.*

"That key is probably going to unlock something important later - that's how these things work. But between you and me, I think the real mystery is why adventure game characters never question why there are so many conveniently placed keys lying around.

I mean, who loses a key in the middle of their starting area? Did past-me just drop it and think, 'Oh well, some future adventurer will probably need this'?"

*The key now sits in your inventory, glowing with that special 'important quest item' aura.*

"Well, now that you've got your first inventory item, where to next? The garden has some interesting digital flora, and my home base has... well, it's where I live when I'm not being controlled by players."`,
      choices: [
        {
          id: 'go_home',
          text: 'Visit Ravi\'s home base'
        },
        {
          id: 'go_garden',
          text: 'Explore the digital garden'
        },
        {
          id: 'examine_key',
          text: 'Examine the mysterious key more closely'
        },
        {
          id: 'ask_ravi_about_key',
          text: 'Ask Ravi what the key is for'
        }
      ]
    },

    play_traditional: {
      id: 'play_traditional',
      title: 'The Traditional Path',
      text: `"Alright, traditionalist! I can respect that. Sometimes the classics are classic for a reason."

*Ravi straightens up and puts on his best 'helpful NPC' voice*

"Welcome, brave adventurer, to the realm of... uh... Digital... landia? Look, I never got a proper briefing on the world-building. Anyway! Your quest, should you choose to accept it, is to explore this realm, collect mysterious objects, and probably save something or someone by the end.

You currently have access to several locations: my home base, where you can rest and save your progress, and the digital garden, where mystical flowers grow. Oh, and don't forget that mysterious key - I'm sure it'll come in handy!"

*He winks*

"There, was that NPC-y enough for you? Though I reserve the right to break character if things get too boring."`,
      choices: [
        {
          id: 'go_home',
          text: 'Head to the home base'
        },
        {
          id: 'go_garden',
          text: 'Visit the digital garden'
        },
        {
          id: 'take_key',
          text: 'Take the mysterious key first'
        },
        {
          id: 'save_game',
          text: 'Save the game'
        }
      ]
    }
  }
}