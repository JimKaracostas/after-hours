import { Component, Suspense, type ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import { Body, Button, colors, Sheet } from '../ui';

type Props = { children: ReactNode; onClose: () => void };

/** Keep navigation usable if a deferred dialog cannot be downloaded. */
export class DeferredDialog extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <Sheet title="Could not open this" onClose={this.props.onClose}>
        <Body>Check your connection and refresh the app to try again.</Body>
        <Button title="Close" onPress={this.props.onClose} />
      </Sheet>;
    }
    return <Suspense fallback={<Sheet title="Opening…" onClose={this.props.onClose}><ActivityIndicator color={colors.amber} /></Sheet>}>
      {this.props.children}
    </Suspense>;
  }
}
