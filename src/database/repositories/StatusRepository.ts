import { Status } from '@structures/DatabaseCollections';

export default class StatusRepository {
  constructor(private statusModal: typeof Status) {}

  async CreateOrUpdate(
    shardID: number,
    ping: number,
    lastPingAt: number,
    guilds: number,
    uptime: number,
  ): Promise<void> {
    const result = await this.statusModal.findById(shardID);
    if (result) {
      await this.statusModal.updateOne(
        { _id: shardID },
        {
          ping,
          lastPingAt: `${lastPingAt ?? 0}`,
          guilds,
          uptime: `${uptime ?? 0}`,
        },
      );
    } else {
      await this.statusModal.create({
        _id: shardID,
        ping,
        lastPingAt,
        guilds,
        uptime,
      });
    }
  }

  async addMaintenance(commandName: string, maintenanceReason: string): Promise<void> {
    await this.statusModal.updateOne(
      { _id: 'main' },
      { $push: { disabledCommands: { name: commandName, reason: maintenanceReason } } },
    );
  }

  async removeMaintenance(commandName: string): Promise<void> {
    await this.statusModal.updateOne(
      { _id: 'main' },
      { $pull: { disabledCommands: { name: commandName } } },
    );
  }
}
