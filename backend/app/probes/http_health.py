import time

import httpx

from app.models import ProbeStatus
from app.probes.base import BaseProbe, ProbeResultData


class HttpHealthProbe(BaseProbe):
    """Checks HTTP health of an sGTM endpoint.

    Pings the sGTM server URL and checks:
    - Is it reachable?
    - Response status code
    - Response time (latency)

    Config options (in probe_config):
        endpoint: Path to check, appended to sgtm_url (default: "/healthy")
        timeout_s: Request timeout in seconds (default: 10)
        warning_threshold_ms: Response time above this = WARNING (default: 2000)
        critical_threshold_ms: Response time above this = CRITICAL (default: 5000)
        expected_status_code: Expected HTTP status (default: 200)
    """

    async def execute(self, site_config: dict, probe_config: dict) -> ProbeResultData:
        sgtm_url = site_config.get("sgtm_url")
        if not sgtm_url:
            return ProbeResultData(
                status=ProbeStatus.ERROR,
                message="No sGTM URL configured for this site",
            )

        endpoint = probe_config.get("endpoint", "/healthy")
        timeout_s = probe_config.get("timeout_s", 10)
        warning_ms = probe_config.get("warning_threshold_ms", 2000)
        critical_ms = probe_config.get("critical_threshold_ms", 5000)
        expected_status = probe_config.get("expected_status_code", 200)

        url = f"{sgtm_url.rstrip('/')}{endpoint}"

        start = time.monotonic()
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=timeout_s, follow_redirects=True)
            elapsed_ms = (time.monotonic() - start) * 1000

            details = {
                "url": url,
                "status_code": response.status_code,
                "response_time_ms": round(elapsed_ms, 1),
            }

            # Check status code
            if response.status_code != expected_status:
                return ProbeResultData(
                    status=ProbeStatus.CRITICAL,
                    message=f"sGTM returned HTTP {response.status_code} (expected {expected_status})",
                    response_time_ms=round(elapsed_ms, 1),
                    details=details,
                )

            # Check response time
            if elapsed_ms > critical_ms:
                return ProbeResultData(
                    status=ProbeStatus.CRITICAL,
                    message=f"sGTM response time {elapsed_ms:.0f}ms exceeds critical threshold ({critical_ms}ms)",
                    response_time_ms=round(elapsed_ms, 1),
                    details=details,
                )

            if elapsed_ms > warning_ms:
                return ProbeResultData(
                    status=ProbeStatus.WARNING,
                    message=f"sGTM response time {elapsed_ms:.0f}ms exceeds warning threshold ({warning_ms}ms)",
                    response_time_ms=round(elapsed_ms, 1),
                    details=details,
                )

            return ProbeResultData(
                status=ProbeStatus.OK,
                message=f"sGTM healthy — {elapsed_ms:.0f}ms",
                response_time_ms=round(elapsed_ms, 1),
                details=details,
            )

        except httpx.TimeoutException:
            elapsed_ms = (time.monotonic() - start) * 1000
            return ProbeResultData(
                status=ProbeStatus.CRITICAL,
                message=f"sGTM timeout after {timeout_s}s — endpoint unreachable",
                response_time_ms=round(elapsed_ms, 1),
                details={"url": url, "error": "timeout"},
            )

        except httpx.ConnectError:
            return ProbeResultData(
                status=ProbeStatus.CRITICAL,
                message=f"sGTM connection refused — server may be down",
                details={"url": url, "error": "connection_refused"},
            )

        except httpx.HTTPError as e:
            return ProbeResultData(
                status=ProbeStatus.CRITICAL,
                message=f"sGTM HTTP error: {e}",
                details={"url": url, "error": str(e)},
            )
