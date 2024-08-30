export class Participant {
  id: string;
  isNative: boolean; // Whether or not participant is below the immersion age.

  constructor(participantId: string, isNative: boolean) {
    this.id = participantId;
    this.isNative = isNative;
  }
}
