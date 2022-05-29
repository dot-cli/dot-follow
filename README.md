# dot-follow

Follow developers with ease

<!-- toc -->

- [dot-follow](#dot-follow)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g dot-follow
$ dot-follow COMMAND
running command...
$ dot-follow (--version)
dot-follow/0.0.0 darwin-arm64 node-v16.14.0
$ dot-follow --help [COMMAND]
USAGE
  $ dot-follow COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`dot-follow follow DEVELOPER`](#dot-follow-follow-developer)
- [`dot-follow help [COMMAND]`](#dot-follow-help-command)
- [`dot-follow plugins`](#dot-follow-plugins)
- [`dot-follow plugins:install PLUGIN...`](#dot-follow-pluginsinstall-plugin)
- [`dot-follow plugins:inspect PLUGIN...`](#dot-follow-pluginsinspect-plugin)
- [`dot-follow plugins:install PLUGIN...`](#dot-follow-pluginsinstall-plugin-1)
- [`dot-follow plugins:link PLUGIN`](#dot-follow-pluginslink-plugin)
- [`dot-follow plugins:uninstall PLUGIN...`](#dot-follow-pluginsuninstall-plugin)
- [`dot-follow plugins:uninstall PLUGIN...`](#dot-follow-pluginsuninstall-plugin-1)
- [`dot-follow plugins:uninstall PLUGIN...`](#dot-follow-pluginsuninstall-plugin-2)
- [`dot-follow plugins update`](#dot-follow-plugins-update)

## `dot-follow follow DEVELOPER`

Follow a developer

```
USAGE
  $ dot-follow follow [DEVELOPER]

ARGUMENTS
  DEVELOPER  Developer to follow

DESCRIPTION
  Follow a developer

EXAMPLES
  $ oex follow chico
```

_See code: [dist/commands/follow/index.ts](https://github.com/dot-cli/dot-follow/blob/v0.0.0/dist/commands/follow/index.ts)_

## `dot-follow help [COMMAND]`

Display help for dot-follow.

```
USAGE
  $ dot-follow help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dot-follow.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `dot-follow plugins`

List installed plugins.

```
USAGE
  $ dot-follow plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ dot-follow plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `dot-follow plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dot-follow plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ dot-follow plugins add

EXAMPLES
  $ dot-follow plugins:install myplugin

  $ dot-follow plugins:install https://github.com/someuser/someplugin

  $ dot-follow plugins:install someuser/someplugin
```

## `dot-follow plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ dot-follow plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ dot-follow plugins:inspect myplugin
```

## `dot-follow plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dot-follow plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ dot-follow plugins add

EXAMPLES
  $ dot-follow plugins:install myplugin

  $ dot-follow plugins:install https://github.com/someuser/someplugin

  $ dot-follow plugins:install someuser/someplugin
```

## `dot-follow plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ dot-follow plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ dot-follow plugins:link myplugin
```

## `dot-follow plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dot-follow plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dot-follow plugins unlink
  $ dot-follow plugins remove
```

## `dot-follow plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dot-follow plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dot-follow plugins unlink
  $ dot-follow plugins remove
```

## `dot-follow plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dot-follow plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dot-follow plugins unlink
  $ dot-follow plugins remove
```

## `dot-follow plugins update`

Update installed plugins.

```
USAGE
  $ dot-follow plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

<!-- commandsstop -->
