# PLAN

This repo is to be deployed, to custom vms.

- should report events to cloud functions,
    - which then can update db.
    - further stats can also be stored to firestore, with a liveUntil timer.

- be capable to choosing service type,
    - service type can then navigate to service stats.
