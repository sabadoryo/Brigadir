class Command {
  private static commands = [];

  public static set(command_name: string, controller_and_method: string) {
    this.commands.push(this.transform(command_name, controller_and_method));
  }

  private static transform(command_name: string, controller_and_method: string) {
    let split_result: string = controller_and_method.split('@');
    return {
      'command_name': command_name,
      'controller_path': split_result[0],
      'method': split_result[1],
    };
  }
}