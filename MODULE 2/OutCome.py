def hardThresholdPolicy(nonConfirmityScore,nonConfirmityThreshold,domainCondition):
        if nonConfirmityScore<nonConfirmityThreshold:
            return 'PASS'
        else:
            return 'FLAG'
def ConformalThresholdPolicy(nonConfirmityScore,nonConfirmityThreshold,bandwidth=0.05):
        if nonConfirmityScore<nonConfirmityThreshold-bandwidth:
            return 'PASS'
        elif nonConfirmityScore>=(nonConfirmityThreshold-bandwidth) and nonConfirmityScore<=(nonConfirmityThreshold+bandwidth):
            return 'review'
        else:
            return 'FLAG'

nonConfirmityScore=float(input())
nonConfirmityThreshold=float(input())
domainCondition=bool(input())
outcomes=int(input())
if outcomes==2:
     outcomeResult=hardThresholdPolicy(nonConfirmityScore,nonConfirmityThreshold)
elif outcomes==3:
     bandwidth=float(input())
     if bandwidth:
        outcomeResult=ConformalThresholdPolicy(nonConfirmityScore,nonConfirmityThreshold,bandwidth)
     else:
        outcomeResult=ConformalThresholdPolicy(nonConfirmityScore,nonConfirmityThreshold)
print(outcomeResult)