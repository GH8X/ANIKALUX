import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/States";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/**
 * Catches render-time crashes so one broken component shows a branded,
 * actionable message instead of a blank white page. `ErrorState` supplies the
 * localised copy, so customers never see a stack trace, and the production
 * bundle logs nothing to the console.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // Development only — the shipped bundle stays silent by design.
      console.error("[render]", error, info.componentStack);
    }
  }

  private reset = () => this.setState({ failed: false });

  render() {
    if (this.state.failed) {
      return (
        <div className="container section">
          <ErrorState onRetry={this.reset} />
        </div>
      );
    }
    return this.props.children;
  }
}
