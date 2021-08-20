import MenheraClient from 'MenheraClient';
import { IAbilitiesFile, IBasicData, IClassesFile, IRacesFiles } from './Types';

export default class BasicFunctions {
  constructor(private client: MenheraClient) {}

  getClassDataById(classId: number | string): IClassesFile {
    return this.client.boleham.Classes.filter((cls) => cls[0] === `${classId}`)[0][1];
  }

  getRaceDataById(raceId: number | string): IRacesFiles {
    return this.client.boleham.Races.filter((cls) => cls[0] === `${raceId}`)[0][1];
  }

  getDataToRegister(userID: string, classID: string, raceID: string): IBasicData {
    const selectedClass = this.getClassDataById(classID);

    const firstAbility = this.client.boleham.Abilities.filter(
      (a) => a[0] === `${100 * Number(classID) + 1}`,
    )[0];

    return {
      id: userID,
      classId: Number(classID),
      raceId: Number(raceID),
      abilities: [{ id: Number(firstAbility[0]), level: 1, xp: 0 }],
      baseArmor: selectedClass.baseArmor,
      baseDamage: selectedClass.baseDamage,
      attackSkill: selectedClass.attackSkill,
      abilitySkill: selectedClass.abilitySkill,
      speed: selectedClass.speed,
    };
  }

  getMaxXpForLevel(level: number): number {
    return this.client.boleham.Experiences[level];
  }

  getAbilityById(id: number): IAbilitiesFile {
    return this.client.boleham.Abilities.filter((a) => a[0] === `${id}`)[0][1];
  }
}
