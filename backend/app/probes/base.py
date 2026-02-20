from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from app.models import ProbeStatus


@dataclass
class ProbeResultData:
    """Raw result from a probe execution, before being persisted."""
    status: ProbeStatus
    message: str
    response_time_ms: float | None = None
    details: dict = field(default_factory=dict)


class BaseProbe(ABC):
    """Base class for all monitoring probes.

    Each probe type implements `execute()` which performs the actual check
    and returns a ProbeResultData with the status and details.
    """

    @abstractmethod
    async def execute(self, site_config: dict, probe_config: dict) -> ProbeResultData:
        """Run the probe check.

        Args:
            site_config: Relevant fields from the Site model (url, sgtm_url, etc.)
            probe_config: Probe-specific config from ProbeConfig.config JSON field.

        Returns:
            ProbeResultData with status, message, and optional details.
        """
        ...
