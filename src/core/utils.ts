import { CharacterSId, IBattleAbleCharacter } from "./typing";

export function isUserCharacter(character: IBattleAbleCharacter) {
  return character.sid === CharacterSId.ME;
}

export function isUserSid(sid: CharacterSId) {
  return sid === CharacterSId.ME;
}
